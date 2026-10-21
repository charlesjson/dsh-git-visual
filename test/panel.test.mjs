import assert from 'node:assert/strict'
import { test, afterEach } from 'node:test'
import { JSDOM } from 'jsdom'
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
globalThis.window = dom.window; globalThis.document = dom.window.document
globalThis.HTMLElement = dom.window.HTMLElement; globalThis.IS_REACT_ACT_ENVIRONMENT = true
const React = await import('react')
const { render, fireEvent, waitFor, cleanup, act } = await import('@testing-library/react')
const { GitPanel } = await import('../dist/panel.js')
afterEach(() => { cleanup(); window.sessionStorage.clear() })

const hash = '1'.repeat(40)
const base = { root: '/repo', branch: 'main', head: hash, ahead: 0, behind: 0, files: [{ path: 'a.txt', index: ' ', worktree: 'M' }], branches: [{ ref: 'refs/heads/main', name: 'main', current: true, remote: false }, { ref: 'refs/heads/feature', name: 'feature', current: false, remote: false }], commits: [{ hash, parents: [], author: 'Test', date: '2026-10-19T00:00:00Z', subject: 'Initial commit', refs: 'HEAD -> main' }], moreCommits: false, filesTruncated: false }
function fixture() {
  const calls = [], state = structuredClone(base)
  const call = async request => {
    calls.push(request)
    if (request.action === 'workspaces') return { workspaces: [{ id: 'w1', title: '测试项目', path: '/repo' }], selected: 'w1' }
    if (request.action === 'snapshot') return structuredClone(state)
    if (request.action === 'diff') return { patch: '--- a/a.txt\n+++ b/a.txt\n@@ -1 +1 @@\n-before\n+after\n', truncated: false, binary: false }
    if (request.action === 'commitDetail') return { commit: base.commits[0], message: 'Initial commit', files: [{ path: 'a.txt', status: 'A' }] }
    if (request.action === 'stage') state.files = state.files.map(file => request.paths.includes(file.path) ? { ...file, index: file.index === '?' ? 'A' : 'M', worktree: ' ' } : file)
    if (request.action === 'unstage') state.files = state.files.map(file => request.paths.includes(file.path) ? { ...file, index: ' ', worktree: 'M' } : file)
    if (request.action === 'commit') state.files = []
    if (request.action === 'switch') state.branch = 'feature'
    return { message: '操作完成' }
  }
  return { calls, state, call }
}

test('loads the session workspace, previews a file, stages and commits explicitly', async () => {
  const fixtureData = fixture(), ui = render(React.createElement(GitPanel, { call: fixtureData.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '暂存 a.txt' })))
  fireEvent.click(ui.getByRole('button', { name: '查看未暂存差异 a.txt' }))
  await waitFor(() => assert.ok(ui.getByLabelText('文件差异').textContent.includes('+after')))
  fireEvent.click(ui.getByRole('button', { name: '暂存 a.txt' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '取消暂存 a.txt' })))
  fireEvent.change(ui.getByLabelText('提交说明'), { target: { value: 'My commit' } })
  fireEvent.click(ui.getByRole('button', { name: '提交 1 个文件', exact: true }))
  await waitFor(() => assert.ok(fixtureData.calls.some(call => call.action === 'commit')))
  const commit = fixtureData.calls.find(call => call.action === 'commit')
  assert.equal(commit.message, 'My commit'); assert.equal(commit.expectedHead, hash); assert.equal(commit.workspaceId, 'w1')
})

test('branch switching requires the explicit confirmation dialog', async () => {
  const fixtureData = fixture(), ui = render(React.createElement(GitPanel, { call: fixtureData.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '暂存 a.txt' })))
  fireEvent.click(ui.getByRole('tab', { name: '提交历史' }))
  fireEvent.change(ui.getByLabelText('查看分支'), { target: { value: 'refs/heads/feature' } })
  await waitFor(() => assert.ok(!ui.getByRole('button', { name: '切换', exact: true }).disabled))
  fireEvent.click(ui.getByRole('button', { name: '切换', exact: true }))
  assert.ok(ui.getByRole('dialog', { name: '切换分支' })); assert.ok(!fixtureData.calls.some(call => call.action === 'switch'))
  fireEvent.click(ui.getByRole('button', { name: '切换分支', exact: true }))
  await waitFor(() => assert.ok(fixtureData.calls.some(call => call.action === 'switch')))
})

test('shows commit details without rendering commit messages as HTML', async () => {
  const fixtureData = fixture(); fixtureData.state.commits[0].subject = '<img src=x onerror=alert(1)>'
  const ui = render(React.createElement(GitPanel, { call: fixtureData.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '暂存 a.txt' })))
  fireEvent.click(ui.getByRole('tab', { name: '提交历史' }))
  fireEvent.click(ui.getByRole('button', { name: /<img src=x/ }))
  await waitFor(() => assert.ok(ui.getByLabelText('提交中的文件')))
  assert.equal(ui.container.querySelector('img'), null)
})

test('preserves the selected file when staging moves it to the other group', async () => {
  const data = fixture(); data.state.files.push({ path: 'b.txt', index: ' ', worktree: 'M' })
  const ui = render(React.createElement(GitPanel, { call: data.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '查看未暂存差异 b.txt' })))
  fireEvent.click(ui.getByRole('button', { name: '查看未暂存差异 b.txt' }))
  fireEvent.click(ui.getByRole('button', { name: '暂存 b.txt' }))
  await waitFor(() => assert.equal(ui.getByRole('button', { name: '查看已暂存差异 b.txt' }).getAttribute('aria-pressed'), 'true'))
  assert.ok(ui.container.querySelector('.gv-detail-open'))
})

test('filtered bulk selection only stages matching files', async () => {
  const data = fixture(); data.state.files = [{ path: 'src/app.ts', index: ' ', worktree: 'M' }, { path: 'docs/readme.md', index: '?', worktree: '?' }]
  const ui = render(React.createElement(GitPanel, { call: data.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByLabelText('搜索文件')))
  fireEvent.change(ui.getByLabelText('搜索文件'), { target: { value: 'src/' } })
  assert.equal(ui.queryByRole('button', { name: '暂存 docs/readme.md' }), null)
  fireEvent.click(ui.getByRole('checkbox', { name: '选择未暂存文件', exact: true }))
  fireEvent.click(ui.getByRole('button', { name: '暂存 1 项', exact: true }))
  await waitFor(() => assert.ok(data.calls.some(call => call.action === 'stage')))
  assert.deepEqual(data.calls.find(call => call.action === 'stage').paths, ['src/app.ts'])
})

test('keeps separate project drafts and restores them after reopening', async () => {
  const data = fixture()
  const call = request => request.action === 'workspaces' ? Promise.resolve({ workspaces: [{ id: 'w1', title: 'One' }, { id: 'w2', title: 'Two' }], selected: 'w1' }) : data.call(request)
  let ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByLabelText('提交说明')))
  fireEvent.change(ui.getByLabelText('提交说明'), { target: { value: 'First project draft' } })
  fireEvent.change(ui.getByLabelText('项目工作区'), { target: { value: 'w2' } })
  await waitFor(() => assert.equal(ui.getByLabelText('提交说明').value, ''))
  fireEvent.change(ui.getByLabelText('提交说明'), { target: { value: 'Second project draft' } })
  fireEvent.change(ui.getByLabelText('项目工作区'), { target: { value: 'w1' } })
  await waitFor(() => assert.equal(ui.getByLabelText('提交说明').value, 'First project draft'))
  ui.unmount(); ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.equal(ui.getByLabelText('提交说明').value, 'First project draft'))
})

test('rapid keyboard submission creates only one commit', async () => {
  const data = fixture(); data.state.files[0].index = 'M'; data.state.files[0].worktree = ' '
  let resolveCommit, started = 0
  const pending = new Promise(resolve => { resolveCommit = resolve })
  const call = request => request.action === 'commit' ? (started++, pending.then(() => data.call(request))) : data.call(request)
  const ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByLabelText('提交说明')))
  const input = ui.getByLabelText('提交说明'); fireEvent.change(input, { target: { value: 'Keyboard commit' } })
  fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true }); fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
  assert.equal(started, 1)
  await act(async () => { resolveCommit(); await pending })
  await waitFor(() => assert.equal(ui.getByLabelText('提交说明').value, ''))
})

test('a successful write followed by refresh failure is not offered as a retryable write', async () => {
  const data = fixture(); let reads = 0, fail = true
  const call = request => request.action === 'snapshot' && ++reads > 1 && fail ? Promise.reject(new Error('offline')) : data.call(request)
  const ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '暂存 a.txt' })))
  fireEvent.click(ui.getByRole('button', { name: '暂存 a.txt' }))
  await waitFor(() => assert.ok(ui.getByRole('alert').textContent.includes('暂存已完成，但状态刷新失败')))
  assert.equal(ui.getByRole('button', { name: '暂存 a.txt' }).disabled, true)
  fail = false; fireEvent.click(ui.getByRole('button', { name: '刷新 Git' }))
  await waitFor(() => assert.equal(ui.getByRole('button', { name: '取消暂存 a.txt' }).disabled, false))
  assert.equal(data.calls.filter(call => call.action === 'stage').length, 1)
})

test('late diff responses cannot replace the file currently being viewed', async () => {
  const data = fixture(); data.state.files.push({ path: 'b.txt', index: ' ', worktree: 'M' })
  let finishA
  const a = new Promise(resolve => { finishA = resolve })
  const call = request => request.action === 'diff' ? request.path === 'a.txt' ? a : Promise.resolve({ patch: '@@ -0,0 +1 @@\n+B CONTENT\n' }) : data.call(request)
  const ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '查看未暂存差异 b.txt' })))
  fireEvent.click(ui.getByRole('button', { name: '查看未暂存差异 b.txt' }))
  await waitFor(() => assert.ok(ui.getByLabelText('文件差异').textContent.includes('B CONTENT')))
  await act(async () => { finishA({ patch: '@@ -0,0 +1 @@\n+A CONTENT\n' }); await a })
  assert.ok(!ui.getByLabelText('文件差异').textContent.includes('A CONTENT'))
})

test('the branch dialog traps focus, closes with Escape and restores its trigger', async () => {
  const data = fixture(), ui = render(React.createElement(GitPanel, { call: data.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('tab', { name: '提交历史' })))
  fireEvent.click(ui.getByRole('tab', { name: '提交历史' }))
  await waitFor(() => assert.ok(ui.getByLabelText('查看分支')))
  fireEvent.change(ui.getByLabelText('查看分支'), { target: { value: 'refs/heads/feature' } })
  await waitFor(() => assert.equal(ui.getByRole('button', { name: '切换', exact: true }).disabled, false))
  const trigger = ui.getByRole('button', { name: '切换', exact: true }); trigger.focus(); fireEvent.click(trigger)
  const cancel = ui.getByRole('button', { name: '取消', exact: true })
  assert.equal(document.activeElement, cancel)
  fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true })
  assert.equal(document.activeElement, ui.getByRole('button', { name: '切换分支', exact: true }))
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  assert.equal(ui.queryByRole('dialog'), null); assert.equal(document.activeElement, trigger)
  assert.ok(!data.calls.some(call => call.action === 'switch'))
})

test('can retry when loading the workspace list initially fails', async () => {
  const data = fixture(); let first = true
  const call = request => request.action === 'workspaces' && first ? (first = false, Promise.reject(new Error('connection lost'))) : data.call(request)
  const ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('alert')))
  fireEvent.click(ui.getByRole('button', { name: '刷新仓库', exact: true }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '暂存 a.txt' })))
})

test('a different session selects that session’s workspace', async () => {
  const data = fixture()
  const call = request => request.action === 'workspaces' ? Promise.resolve({ workspaces: [{ id: 'w1', title: 'One' }, { id: 'w2', title: 'Two' }], selected: request.sessionId === 's1' ? 'w1' : 'w2' }) : data.call(request)
  const ui = render(React.createElement(GitPanel, { call, sessionId: 's1' }))
  await waitFor(() => assert.equal(ui.getByLabelText('项目工作区').value, 'w1'))
  ui.rerender(React.createElement(GitPanel, { call, sessionId: 's2' }))
  await waitFor(() => assert.equal(ui.getByLabelText('项目工作区').value, 'w2'))
})

test('commit search opens the matching commit and clears details for empty results', async () => {
  const data = fixture(), second = '2'.repeat(40)
  data.state.commits.push({ ...base.commits[0], hash: second, subject: 'Fix selected file' })
  const ui = render(React.createElement(GitPanel, { call: data.call, sessionId: 's1' }))
  await waitFor(() => assert.ok(ui.getByRole('button', { name: '暂存 a.txt' })))
  fireEvent.click(ui.getByRole('tab', { name: '提交历史' }))
  fireEvent.change(ui.getByLabelText('搜索提交'), { target: { value: 'Fix selected' } })
  await waitFor(() => assert.ok(data.calls.some(call => call.action === 'commitDetail' && call.hash === second)))
  fireEvent.change(ui.getByLabelText('搜索提交'), { target: { value: 'no such commit' } })
  await waitFor(() => assert.equal(ui.queryByLabelText('提交中的文件'), null))
})
