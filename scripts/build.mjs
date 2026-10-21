import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
await mkdir('dist', { recursive: true })
await build({
  entryPoints: ['src/client.tsx'], bundle: true, platform: 'browser', format: 'cjs', target: 'es2022',
  external: ['react'], outfile: 'dist/client.js',
  banner: { js: 'window.__ModuleLoader__.load({id:"dsh-git-visual",factory:(require)=>{var module={exports:{}};var exports=module.exports;' },
  footer: { js: 'return module.exports;}});' },
})
