import { createServer } from 'node:http'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'esbuild'
import { Context } from '@deepseek-ai/cordis'
import { TypertRegistry } from '@deepseek-ai/dsh-typert-registry'
import { TypertGatewayService } from '@deepseek-ai/dsh-api-gateway'
import * as plugin from '../dist/index.js'

const repository = await mkdtemp(join(tmpdir(), 'dsh-git-preview-'))
const git = (...args) => execFileSync('git', args, { cwd: repository, encoding: 'utf8' })
git('init', '-q', '-b', 'main'); git('config', 'user.name', 'Developer'); git('config', 'user.email', 'dev@example.invalid'); git('config', 'commit.gpgsign', 'false')
await mkdir(join(repository, 'src')); await writeFile(join(repository, 'README.md'), '# Example project\n'); await writeFile(join(repository, 'src/app.ts'), 'export const title = "Hello world"\n\nexport function greet(name: string) {\n  return `Hello, ${name}`\n}\n')
git('add', '.'); git('commit', '-qm', 'Initialize application')
git('switch', '-qc', 'feature/git-panel'); await writeFile(join(repository, 'src/git.ts'), 'export const gitEnabled = true\n'); git('add', '.'); git('commit', '-qm', 'Add Git provider')
git('switch', '-q', 'main'); await writeFile(join(repository, 'README.md'), '# Example project\n\nA local development workspace.\n'); git('add', '.'); git('commit', '-qm', 'Document local development')
git('merge', '--no-ff', '-qm', 'Merge Git provider', 'feature/git-panel'); git('tag', 'v1.0.0')
await writeFile(join(repository, 'src/app.ts'), 'export const title = "Git workspace"\n\nexport function greet(name: string) {\n  return `Welcome, ${name}!`\n}\n')
await writeFile(join(repository, '.gitignore'), 'node_modules/\ndist/\n'); git('add', '.gitignore')
await writeFile(join(repository, 'notes.md'), 'Notes for the next release.\n')
const ctx = new Context()
ctx.provide('workspaceRegistry', { list: () => [{ id: 'preview', path: repository, title: '示例项目 · 测试仓库', sessionIds: ['preview'] }] })
ctx.provide('remoteAccess', { decide: () => ({ kind: 'deny', reason: 'preview' }) })
await ctx.plugin(TypertRegistry); await ctx.plugin(TypertGatewayService); await ctx.plugin(plugin)
const signal = new AbortController().signal
const peer = { id: 'preview-owner', ctx, principal: { kind: 'owner' }, signal, interactions: 'none' }
await mkdir('preview', { recursive: true })
await writeFile('preview/entry.tsx', `import React from 'react';import{createRoot}from'react-dom/client';import{GitPanel}from'../src/panel';import{css}from'../src/styles';const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);const call=async(request,signal)=>{const response=await fetch('/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({request}),signal});const result=await response.json();if(!result.ok)throw new Error(result.error);return result.value};createRoot(document.getElementById('app')).render(<GitPanel call={call} sessionId="preview"/>);`)
await build({ entryPoints: ['preview/entry.tsx'], bundle: true, outfile: 'preview/app.js', platform: 'browser', format: 'iife', define: { 'process.env.NODE_ENV': '"development"' } })
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Git 插件预览</title><style>html,body{margin:0;height:100%;background:#eef1f5;font:13px system-ui}body{display:flex;align-items:center;justify-content:center}#app{width:min(1100px,100%);height:min(820px,100%);border:1px solid #dde1e8;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px #14233a12}@media(max-width:720px){#app{height:100%;border:0;border-radius:0}}</style><div id="app"></div><script src="/app.js"></script></html>`
const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') { res.setHeader('content-type', 'text/html;charset=utf-8'); res.end(html); return }
    if (req.method === 'GET' && req.url === '/app.js') { res.setHeader('content-type', 'text/javascript'); res.end(await readFile('preview/app.js')); return }
    if (req.method === 'POST' && req.url === '/api') {
      if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) { res.writeHead(403); res.end(); return }
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 100_000) throw new Error('Request too large') }
      const value = await ctx.typertGateway.invoke({ namespace: 'gitVisual', method: 'request', args: { request: JSON.parse(body).request }, signal, peer })
      res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: true, value })); return
    }
    res.writeHead(404); res.end()
  } catch (error) { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: false, error: error.message })) }
})
server.listen(0, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${server.address().port}/`))
async function stop() { server.close(); await ctx.fiber.dispose(); await rm(repository, { recursive: true, force: true }); process.exit(0) }
process.on('SIGINT', stop); process.on('SIGTERM', stop)
