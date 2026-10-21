import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseDiff, splitDiff } from '../dist/diff-model.js'

test('distinguishes real code beginning with header-like signs from Git metadata', () => {
  const value = parseDiff('--- a/x\n+++ b/x\n@@ -2,2 +2,3 @@\n--- old code\n+++ new code\n+extra\n context\n')
  assert.equal(value.added, 2); assert.equal(value.deleted, 1); assert.equal(value.hunks, 1)
  assert.deepEqual(value.lines.filter(line => ['add', 'del'].includes(line.kind)).map(line => [line.kind, line.old, line.next]), [['del', 2, null], ['add', null, 2], ['add', null, 3]])
})

test('aligns unequal deletion and addition blocks in side-by-side view', () => {
  const value = parseDiff('@@ -1,2 +1,3 @@\n-before\n+after\n+extra\n context\n')
  const rows = splitDiff(value.lines)
  assert.equal(rows[1].left.text, '-before'); assert.equal(rows[1].right.text, '+after')
  assert.equal(rows[2].left, undefined); assert.equal(rows[2].right.text, '+extra')
  assert.equal(rows[3].left.old, 2); assert.equal(rows[3].right.next, 3)
})
