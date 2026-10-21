import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, writeFile, readFile, rename, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { repositoryRoot, snapshot, diff, commitDetail, mutate, parseStatus, runGit } from '../dist/git.js'
import { layoutGraph } from '../dist/graph.js'

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' } }).trim()
async function fixture(t, committed = true) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-git-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  git(root, 'init', '-q', '-b', 'main')
  git(root, 'config', 'user.name', 'Git Test'); git(root, 'config', 'user.email', 'test@example.invalid')
  git(root, 'config', 'commit.gpgsign', 'false')
  await writeFile(join(root, 'a.txt'), 'one\ntwo\n')
  if (committed) { git(root, 'add', '.'); git(root, 'commit', '-qm', 'Initial commit') }
  return root
}

test('reads the actual repository status, refs, log and graph', async t => {
  const root = await fixture(t)
  git(root, 'switch', '-qc', 'feature')
  await writeFile(join(root, 'feature.txt'), 'feature\n'); git(root, 'add', '.'); git(root, 'commit', '-qm', 'Feature work')
  git(root, 'switch', '-q', 'main')
  await writeFile(join(root, 'main.txt'), 'main\n'); git(root, 'add', '.'); git(root, 'commit', '-qm', 'Main work')
  git(root, 'merge', '--no-ff', '-qm', 'Merge feature', 'feature')
  const value = await snapshot(root, { action: 'snapshot' })
  assert.equal(value.branch, 'main'); assert.equal(value.files.length, 0)
  assert.equal(value.commits.length, 4); assert.equal(value.commits[0].parents.length, 2)
  const graph = layoutGraph(value.commits)
  assert.ok(graph.lanes >= 2); assert.equal(graph.rows[0].parents.length, 2)
  assert.ok(graph.rows.flatMap(row => row.parents).every(parent => parent.to >= 0))
  const details = await commitDetail(root, value.commits[0].hash)
  assert.equal(details.commit.subject, 'Merge feature')
  assert.ok(details.files.some(file => file.path === 'feature.txt'))
})

test('stages, previews, unstages and commits only selected files', async t => {
  const root = await fixture(t), before = await snapshot(root, { action: 'snapshot' })
  await writeFile(join(root, 'a.txt'), 'one\nchanged\n'); await writeFile(join(root, 'untracked.txt'), 'untracked\n')
  const change = await diff(root, { action: 'diff', mode: 'working', path: 'a.txt' })
  assert.ok(change.patch.includes('+changed'))
  await mutate(root, { action: 'stage', paths: ['a.txt'], expectedHead: before.head })
  assert.ok((await diff(root, { action: 'diff', mode: 'staged', path: 'a.txt' })).patch.includes('+changed'))
  await mutate(root, { action: 'unstage', paths: ['a.txt'], expectedHead: before.head })
  assert.equal((await snapshot(root, { action: 'snapshot' })).files.find(file => file.path === 'a.txt').index, ' ')
  await mutate(root, { action: 'stage', paths: ['a.txt'], expectedHead: before.head })
  await mutate(root, { action: 'commit', message: 'Update a\n\nOnly the staged file.', expectedHead: before.head })
  const after = await snapshot(root, { action: 'snapshot' })
  assert.notEqual(after.head, before.head); assert.equal(after.commits[0].subject, 'Update a')
  assert.deepEqual(after.files.map(file => file.path), ['untracked.txt'])
  const details = await commitDetail(root, after.head)
  assert.ok(details.message.includes('Only the staged file.')); assert.deepEqual(details.files.map(file => file.path), ['a.txt'])
})

test('supports the first commit and unstaging before HEAD exists', async t => {
  const root = await fixture(t, false)
  const empty = await snapshot(root, { action: 'snapshot' })
  assert.equal(empty.head, null); assert.equal(empty.commits.length, 0); assert.equal(empty.branch, 'main')
  await mutate(root, { action: 'stage', paths: ['a.txt'], expectedHead: null })
  await mutate(root, { action: 'unstage', paths: ['a.txt'], expectedHead: null })
  assert.equal(await readFile(join(root, 'a.txt'), 'utf8'), 'one\ntwo\n')
  await mutate(root, { action: 'stage', paths: ['a.txt'], expectedHead: null })
  await mutate(root, { action: 'commit', message: 'First commit', expectedHead: null })
  const value = await snapshot(root, { action: 'snapshot' })
  assert.equal(value.commits.length, 1)
  assert.ok((await diff(root, { action: 'diff', mode: 'commit', hash: value.head, path: 'a.txt' })).patch.includes('+one'))
})

test('handles unusual filenames and staged renames', async t => {
  const root = await fixture(t)
  const weird = 'space\tand\nnewline.txt'
  await writeFile(join(root, weird), 'text\n')
  let value = await snapshot(root, { action: 'snapshot' })
  assert.ok(value.files.some(file => file.path === weird))
  await mutate(root, { action: 'stage', paths: [weird], expectedHead: value.head })
  assert.ok((await diff(root, { action: 'diff', mode: 'staged', path: weird })).patch.includes('+text'))
  git(root, 'mv', 'a.txt', 'renamed.txt')
  value = await snapshot(root, { action: 'snapshot' })
  const file = value.files.find(file => file.path === 'renamed.txt')
  assert.equal(file.oldPath, 'a.txt')
  await writeFile(join(root, 'renamed.txt'), 'edited after rename\n')
  await mutate(root, { action: 'stage', paths: ['renamed.txt'], expectedHead: value.head })
  value = await snapshot(root, { action: 'snapshot' })
  await mutate(root, { action: 'unstage', paths: ['renamed.txt'], expectedHead: value.head })
  assert.equal(await readFile(join(root, 'renamed.txt'), 'utf8'), 'edited after rename\n')
})

test('untracked previews reject symlinks and recognize binary files', async t => {
  const root = await fixture(t)
  await writeFile(join(root, 'binary.bin'), Buffer.from([1, 0, 2]))
  await symlink('/etc/passwd', join(root, 'link'))
  assert.equal((await diff(root, { action: 'diff', mode: 'working', path: 'binary.bin' })).binary, true)
  const link = await diff(root, { action: 'diff', mode: 'working', path: 'link' })
  assert.ok(!link.patch.includes('root:'))
})

test('treats pathspec magic and shell syntax as literal filenames', async t => {
  const root = await fixture(t)
  for (const name of [':(glob)*', '$(touch injected)', '-file.txt']) await writeFile(join(root, name), 'literal\n')
  const value = await snapshot(root, { action: 'snapshot' })
  await mutate(root, { action: 'stage', paths: [':(glob)*'], expectedHead: value.head })
  const staged = (await snapshot(root, { action: 'snapshot' })).files.filter(file => file.index === 'A')
  assert.deepEqual(staged.map(file => file.path), [':(glob)*'])
  await assert.rejects(mutate(root, { action: 'stage', paths: ['../outside'], expectedHead: value.head }), { code: 'INVALID_PATH' })
  await assert.rejects(diff(root, { action: 'diff', path: '/etc/passwd' }), { code: 'INVALID_PATH' })
})

test('branch switching uses local refs and refuses conflicting worktree changes', async t => {
  const root = await fixture(t)
  git(root, 'switch', '-qc', 'feature'); await writeFile(join(root, 'a.txt'), 'branch version\n'); git(root, 'commit', '-am', 'Branch change', '-q')
  git(root, 'switch', '-q', 'main'); await writeFile(join(root, 'a.txt'), 'unsaved changes\n')
  const value = await snapshot(root, { action: 'snapshot' })
  await assert.rejects(mutate(root, { action: 'switch', ref: 'refs/heads/feature', expectedHead: value.head }), { code: 'GIT_FAILED' })
  assert.equal(await readFile(join(root, 'a.txt'), 'utf8'), 'unsaved changes\n')
  assert.equal(git(root, 'branch', '--show-current'), 'main')
  await writeFile(join(root, 'a.txt'), 'one\ntwo\n')
  await mutate(root, { action: 'switch', ref: 'refs/heads/feature', expectedHead: value.head })
  assert.equal(git(root, 'branch', '--show-current'), 'feature')
})

test('rejects a stale HEAD before writing and an empty staging area before commit', async t => {
  const root = await fixture(t), before = await snapshot(root, { action: 'snapshot' })
  await assert.rejects(mutate(root, { action: 'commit', message: 'Nothing', expectedHead: before.head }), { code: 'NOTHING_STAGED' })
  await writeFile(join(root, 'a.txt'), 'new\n'); git(root, 'commit', '-am', 'External commit', '-q')
  await assert.rejects(mutate(root, { action: 'commit', message: 'Stale', expectedHead: before.head }), { code: 'STALE_HEAD' })
})

test('does not execute configured diff or fsmonitor commands when reading', async t => {
  const root = await fixture(t)
  git(root, 'config', 'diff.external', 'touch SHOULD_NOT_EXIST'); git(root, 'config', 'core.fsmonitor', 'touch SHOULD_NOT_EXIST')
  await writeFile(join(root, 'a.txt'), 'changed\n')
  const value = await snapshot(root, { action: 'snapshot' })
  assert.equal(value.files.length, 1)
  assert.ok((await diff(root, { action: 'diff', mode: 'working', path: 'a.txt' })).patch.includes('+changed'))
})

test('validates refs and commit ids and reports a non-repository', async t => {
  const root = await fixture(t)
  await assert.rejects(snapshot(root, { action: 'snapshot', ref: '--all' }), { code: 'UNKNOWN_BRANCH' })
  await assert.rejects(commitDetail(root, '--output=/tmp/bad'), { code: 'INVALID_COMMIT' })
  const plain = await mkdtemp(join(tmpdir(), 'dsh-git-plain-')); t.after(() => rm(plain, { recursive: true, force: true }))
  await assert.rejects(repositoryRoot(plain), { code: 'NOT_REPOSITORY' })
})

test('cancels Git requests and parses branch tracking counters', async t => {
  const root = await fixture(t), controller = new AbortController(); controller.abort()
  await assert.rejects(runGit(root, ['status'], controller.signal))
  const value = parseStatus('## main...origin/main [ahead 2, behind 3]\0 M a.txt\0R  new.txt\0old.txt\0')
  assert.equal(value.ahead, 2); assert.equal(value.behind, 3); assert.equal(value.branch, 'main'); assert.equal(value.files[1].oldPath, 'old.txt')
})
