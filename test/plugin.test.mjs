import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { createContext, runInContext } from 'node:vm'
import { parse } from 'yaml'
import { Context } from '@deepseek-ai/cordis'
import { TypertRegistry } from '@deepseek-ai/dsh-typert-registry'
import { TypertGatewayService } from '@deepseek-ai/dsh-api-gateway'
import { applyEntryPatches } from '@deepseek-ai/cordis-plugin-include'
import * as plugin from '../dist/index.js'
import * as React from 'react'

test('actual Gateway discovers the Remote service and enforces workspace selection', async t => {
  const path = await mkdtemp(join(tmpdir(), 'dsh-git-gateway-'))
  t.after(() => rm(path, { recursive: true, force: true }))
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: path })
  await writeFile(join(path, 'test.txt'), 'test\n')
  const ctx = new Context()
  ctx.provide('workspaceRegistry', { list: () => [{ id: 'w1', path, title: 'Test', sessionIds: ['s1'] }] })
  ctx.provide('remoteAccess', { decide: () => ({ kind: 'deny', reason: 'test' }) })
  await ctx.plugin(TypertRegistry); await ctx.plugin(TypertGatewayService); await ctx.plugin(plugin)
  const signal = new AbortController().signal
  const peer = { id: 'test-peer', ctx, principal: { kind: 'owner' }, signal, interactions: 'none' }
  const call = request => ctx.typertGateway.invoke({ namespace: 'gitVisual', method: 'request', args: { request }, signal, peer })
  try {
    const workspaces = await call({ action: 'workspaces', sessionId: 's1' })
    assert.equal(workspaces.selected, 'w1')
    const value = await call({ action: 'snapshot', workspaceId: 'w1' })
    assert.equal(value.head, null); assert.equal(value.files[0].path, 'test.txt')
    await call({ action: 'stage', workspaceId: 'w1', paths: ['test.txt'], expectedHead: null })
    assert.equal((await call({ action: 'snapshot', workspaceId: 'w1' })).files[0].index, 'A')
    await assert.rejects(call({ action: 'snapshot', workspaceId: '../other' }), /请选择 Harness/)
  } finally { await ctx.fiber.dispose() }
})

test('bundle inserts a separate native plugin row without touching other entries', async () => {
  const patch = parse(await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8'))
  const warnings = []
  const rows = applyEntryPatches([{ id: 'web-fetch-fakeip', name: 'dsh-web-fetch-fakeip/runtime' }], patch, (...args) => warnings.push(args))
  assert.equal(warnings.length, 0); assert.equal(rows.length, 2)
  assert.equal(rows[1].name, 'dsh-git-visual')
})

test('client bundle registers with the real module-loader format and shares React', async () => {
  const source = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8')
  let registration
  runInContext(source, createContext({ window: { __ModuleLoader__: { load: value => { registration = value } } } }))
  assert.equal(registration.id, 'dsh-git-visual')
  const client = registration.factory(name => { assert.equal(name, 'react'); return React })
  assert.ok(client.inject.includes('connection')); assert.ok(client.inject.includes('sidebarRightTabs'))
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(manifest.dsh.client.platform, 'web'); assert.ok(manifest.exports['./client'])
  assert.equal(typeof client.apply, 'function')
})
