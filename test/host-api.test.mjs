import { readFile } from 'node:fs/promises'
import { createContext, runInContext } from 'node:vm'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { apply } from '../dist/index.js'

test('a missing host API is reported before any plugin effects are registered', async () => {
  const effects = []
  const ctx = { plugin: () => { effects.push('registered') }, workspaceRegistry: { list: () => { effects.push('registered') } } }
  delete ctx.workspaceRegistry.list
  await assert.rejects(async () => apply(ctx, {}), error => {
    assert.equal(error.code, 'DSH_API_UNSUPPORTED')
    assert.deepEqual(error.missingMethods, ['workspaceRegistry.list'])
    assert.match(error.message, /dsh-git-visual/)
    return true
  })
  assert.deepEqual(effects, [])
})

test('a missing client API disables only this contribution before any UI effects', async () => {
  const effects = [], warnings = []
  let registration
  const source = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8')
  runInContext(source, createContext({ console: { warn: value => warnings.push(value) }, window: { __ModuleLoader__: { load: value => { registration = value } } } }))
  const client = registration.factory(name => name === 'react-dom' ? ReactDOM : React)
  const ctx = { effect() { effects.push('registered') }, slots: { inject() {}, register() {} }, sidebarRightTabs: { register() {} }, connection: { rpc: { call() {} } } }
  delete ctx.slots.register
  assert.doesNotThrow(() => client.apply(ctx))
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /slots.register/)
  assert.deepEqual(effects, [])
})
