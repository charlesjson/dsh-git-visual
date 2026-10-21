import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { GitCall, GitCommitDetail, GitDiff, GitFile, GitRequest } from './types.js'
import { layoutGraph } from './graph.js'
import { GitIcon, Icon } from './icons.js'
import { DiffView } from './diff-view.js'
import { BranchDialog } from './dialog.js'
import { errorText, useWorkspace } from './use-workspace.js'
export { GitIcon, DiffView }

const COLORS = ['#6588ed', '#d19a48', '#58ae93', '#bd7bd0', '#e17c83', '#5aaac1']
const STATUS: Record<string, string> = { M: '修改', A: '新增', D: '删除', R: '改名', C: '复制', '?': '未跟踪', U: '冲突', T: '类型变化' }
type Mode = 'working' | 'history'
type Selection = { path: string; mode: 'working' | 'staged' | 'commit'; hash?: string }
const conflict = (file: GitFile) => ['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'].includes(file.index + file.worktree)
const isStaged = (file: GitFile) => !conflict(file) && ![' ', '?', '!'].includes(file.index)
const isWorking = (file: GitFile) => conflict(file) || file.worktree !== ' ' || file.index === '?'
const fileKey = (mode: string, path: string) => mode + ':' + path
function dateLabel(date: string) { const value = new Date(date); return Number.isNaN(value.getTime()) ? '' : value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
function readDraft(workspace: string): string { try { return workspace ? window.sessionStorage.getItem('dsh-git-visual:draft:' + workspace) ?? '' : '' } catch { return '' } }

function Graph({ row, width }: { row: ReturnType<typeof layoutGraph>['rows'][number]; width: number }) {
  const x = (lane: number) => 14 + lane * 14
  return <svg width={width} height={62} className="gv-graph" aria-hidden="true">
    {row.through.map((line, i) => <path key={i} d={`M${x(line.from)} 0 C${x(line.from)} 31 ${x(line.to)} 31 ${x(line.to)} 62`} stroke={COLORS[line.color]} strokeWidth="1.7" fill="none"/>)}
    {row.incoming && <path d={`M${x(row.lane)} 0V31`} stroke={COLORS[row.color]} strokeWidth="1.7"/>}
    {row.parents.map((line, i) => <path key={i} d={`M${x(row.lane)} 31 C${x(row.lane)} 46 ${x(line.to)} 42 ${x(line.to)} 62`} stroke={COLORS[line.color]} strokeWidth="1.7" fill="none"/>)}
    <circle cx={x(row.lane)} cy="31" r="4.5" stroke={COLORS[row.color]} strokeWidth="2" fill="var(--gv-bg)"/>
  </svg>
}

function CheckBox({ checked, partial, label, disabled, onChange }: { checked: boolean; partial?: boolean; label: string; disabled?: boolean; onChange(): void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!partial }, [partial])
  return <input ref={ref} className="gv-checkbox" type="checkbox" aria-label={label} checked={checked} disabled={disabled} onChange={onChange}/>
}

function FileGroup({ mode, items, allCount, selected, onToggle, onToggleAll, onView, onWrite, current, disabled, filtered }: {
  mode: 'staged' | 'working'; items: GitFile[]; allCount: number; selected: Set<string>; current: Selection | null; disabled: boolean; filtered: boolean
  onToggle(key: string): void; onToggleAll(keys: string[]): void; onView(file: GitFile): void; onWrite(request: GitRequest): void
}) {
  const [open, setOpen] = useState(true)
  const title = mode === 'staged' ? '已暂存' : '未暂存'
  const count = items.filter(file => selected.has(fileKey(mode, file.path))).length
  return <section className="gv-file-group" aria-label={title}>
    <div className="gv-section-head">
      <CheckBox label={`选择${title}文件`} checked={items.length > 0 && count === items.length} partial={count > 0 && count < items.length} disabled={disabled || !items.length} onChange={() => onToggleAll(items.map(file => fileKey(mode, file.path)))}/>
      <button className="gv-group-toggle" aria-expanded={open} onClick={() => setOpen(value => !value)}><Icon name="chevron" size={12} className={open ? 'gv-rotate' : ''}/>{title}<span className="gv-number">{filtered ? `${items.length}/${allCount}` : allCount}</span></button>
      <button className="gv-text-btn" disabled={disabled || !items.length} onClick={() => onWrite({ action: mode === 'staged' ? 'unstage' : 'stage', paths: items.map(file => file.path) })}>{mode === 'staged' ? filtered ? '取消匹配项' : '全部取消' : filtered ? '暂存匹配项' : '全部暂存'}</button>
    </div>
    {open && <div role="list" className="gv-file-list">{items.length ? items.map(file => {
      const name = file.path.split('/').pop(), directory = file.path.includes('/') ? file.path.slice(0, -name!.length).replace(/\/$/, '') : '项目根目录'
      const status = conflict(file) ? 'U' : file.index === '?' ? '?' : mode === 'staged' ? file.index : file.worktree
      const key = fileKey(mode, file.path)
      return <div role="listitem" className={`gv-file${current?.path === file.path && current.mode === mode ? ' gv-selected' : ''}${selected.has(key) ? ' gv-checked' : ''}`} key={file.path}>
        <CheckBox label={`选择${title}文件 ${file.path}`} checked={selected.has(key)} disabled={disabled} onChange={() => onToggle(key)}/>
        <button className="gv-file-main gv-list-focus" aria-label={`查看${title}差异 ${file.path}`} aria-pressed={current?.path === file.path && current.mode === mode} title={file.oldPath ? file.oldPath + ' → ' + file.path : file.path} onClick={() => onView(file)}>
          <Icon name="file" size={17}/><span className="gv-file-copy"><span className="gv-file-name">{name}</span><span className="gv-file-dir">{directory}</span></span><span className="gv-status" data-status={status}>{STATUS[status] ?? status}</span>
        </button>
        <button className="gv-icon-btn gv-file-action" disabled={disabled} aria-label={(mode === 'staged' ? '取消暂存 ' : '暂存 ') + file.path} title={mode === 'staged' ? '取消暂存' : conflict(file) ? '暂存并标记冲突已解决' : '暂存文件'} onClick={() => onWrite({ action: mode === 'staged' ? 'unstage' : 'stage', paths: [file.path] })}><Icon name={mode === 'staged' ? 'minus' : 'plus'}/></button>
      </div>
    }) : <div className="gv-empty-small">{filtered ? '没有匹配的文件' : mode === 'staged' ? '暂存需要提交的文件，它们会出现在这里。' : '没有未暂存的改动'}</div>}</div>}
  </section>
}

export function GitPanel({ call, sessionId }: { call: GitCall; sessionId: string }) {
  const repo = useWorkspace(call, sessionId)
  const { workspace, data, loading, busy, ref, limit } = repo
  const [mode, setMode] = useState<Mode>('working'), [fileQuery, setFileQuery] = useState(''), [commitQuery, setCommitQuery] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null), [patch, setPatch] = useState<GitDiff | null>(null), [patchLoading, setPatchLoading] = useState(false)
  const [hash, setHash] = useState(''), [detail, setDetail] = useState<GitCommitDetail | null>(null), [detailLoading, setDetailLoading] = useState(false)
  const [confirm, setConfirm] = useState<string | null>(null), [detailOpen, setDetailOpen] = useState(false), [picked, setPicked] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const root = useRef<HTMLDivElement>(null), search = useRef<HTMLInputElement>(null)
  const id = useId(), message = drafts[workspace] ?? readDraft(workspace)
  const setMessage = (value: string) => {
    setDrafts(previous => ({ ...previous, [workspace]: value }))
    try { if (value) window.sessionStorage.setItem('dsh-git-visual:draft:' + workspace, value); else window.sessionStorage.removeItem('dsh-git-visual:draft:' + workspace) } catch {}
  }
  const staged = data?.files.filter(isStaged) ?? [], working = data?.files.filter(isWorking) ?? []
  const disabled = !!busy || loading || repo.outdated || !data
  const graph = useMemo(() => layoutGraph(data?.commits ?? []), [data?.commits])
  const query = mode === 'working' ? fileQuery : commitQuery, normalized = query.trim().toLocaleLowerCase()
  const matchesFile = (file: GitFile) => !normalized || (file.path + ' ' + (file.oldPath ?? '')).toLocaleLowerCase().includes(normalized)
  const shownStaged = staged.filter(matchesFile), shownWorking = working.filter(matchesFile)
  const commits = (data?.commits ?? []).map((commit, index) => ({ commit, index })).filter(({ commit }) => !normalized || [commit.subject, commit.author, commit.hash, commit.refs].join(' ').toLocaleLowerCase().includes(normalized))
  const pickedStaged = staged.filter(file => picked.has(fileKey('staged', file.path))), pickedWorking = working.filter(file => picked.has(fileKey('working', file.path)))
  const viewingBranch = data?.branches.find(branch => branch.ref === ref)
  const visibleKeys = new Set([...shownStaged.map(file => fileKey('staged', file.path)), ...shownWorking.map(file => fileKey('working', file.path))])
  const hiddenPicked = [...picked].filter(key => !visibleKeys.has(key)).length

  useEffect(() => {
    if (!data) return
    const valid = new Set([...data.files.filter(isStaged).map(file => fileKey('staged', file.path)), ...data.files.filter(isWorking).map(file => fileKey('working', file.path))])
    setPicked(previous => new Set([...previous].filter(key => valid.has(key))))
    if (mode === 'working') {
      setSelection(previous => {
        const found = previous?.mode !== 'commit' ? data.files.find(file => file.path === previous?.path) : undefined
        const file = found ?? data.files.find(isWorking) ?? data.files.find(isStaged)
        if (!file) return null
        const nextMode = previous?.mode === 'staged' && isStaged(file) ? 'staged' : isWorking(file) ? 'working' : 'staged'
        if (previous?.path === file.path && previous.mode === nextMode) return previous
        return { path: file.path, mode: nextMode }
      })
      if (!data.files.length) setDetailOpen(false)
    } else if (!commits.some(({ commit }) => commit.hash === hash)) setHash(commits[0]?.commit.hash ?? '')
  }, [data, mode, hash, normalized])

  useEffect(() => {
    if (!selection || !workspace) { setPatch(null); setPatchLoading(false); return }
    const controller = new AbortController(); setPatchLoading(true)
    call<GitDiff>({ action: 'diff', workspaceId: workspace, ...selection }, controller.signal).then(result => { if (!controller.signal.aborted) setPatch(result) })
      .catch(error => { if (!controller.signal.aborted) { setPatch(null); repo.setError(errorText(error)) } }).finally(() => { if (!controller.signal.aborted) setPatchLoading(false) })
    return () => controller.abort()
  }, [call, workspace, selection, data])
  useEffect(() => {
    if (!hash || !workspace || mode !== 'history') { setDetail(null); setDetailLoading(false); if (mode === 'history') setSelection(null); return }
    const controller = new AbortController(); setDetailLoading(true); setDetail(null); setSelection(null)
    call<GitCommitDetail>({ action: 'commitDetail', workspaceId: workspace, hash }, controller.signal).then(result => {
      if (controller.signal.aborted) return
      setDetail(result); setSelection(result.files[0] ? { path: result.files[0].path, mode: 'commit', hash } : null)
    }).catch(error => { if (!controller.signal.aborted) repo.setError(errorText(error)) }).finally(() => { if (!controller.signal.aborted) setDetailLoading(false) })
    return () => controller.abort()
  }, [call, workspace, hash, mode])

  const reset = () => { setSelection(null); setHash(''); setDetail(null); setPatch(null); setDetailOpen(false); setPicked(new Set()) }
  const changeMode = (next: Mode) => { if (next !== mode) { setMode(next); reset() } }
  const toggle = (key: string) => setPicked(previous => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next })
  const toggleAll = (keys: string[]) => setPicked(previous => { const next = new Set(previous), remove = keys.every(key => next.has(key)); keys.forEach(key => { if (remove) next.delete(key); else next.add(key) }); return next })
  const write = async (request: GitRequest) => { if (await repo.mutate(request) && request.action === 'commit') { setMessage(''); setPicked(new Set()) } }
  const chooseFile = (file: GitFile, mode: 'working' | 'staged') => { setPatch(null); setPatchLoading(true); setSelection({ path: file.path, mode }); setDetailOpen(true) }
  const back = () => { setDetailOpen(false); setTimeout(() => root.current?.querySelector<HTMLButtonElement>('.gv-list-focus[aria-pressed="true"]')?.focus(), 0) }
  const copyHash = async () => {
    try { await navigator.clipboard.writeText(hash); repo.setNotice('提交哈希已复制') }
    catch { repo.setError('无法访问剪贴板。提交哈希：' + hash) }
  }
  const selectedName = selection?.path.split('/').pop()
  const selectedPath = selection?.path.includes('/') ? selection.path.slice(0, -selectedName!.length).replace(/\/$/, '') : ''

  return <div ref={root} className={`gv-root${detailOpen ? ' gv-detail-open' : ''}`} aria-label="Git 可视化" onKeyDown={event => {
    if (confirm) return
    const editable = event.target instanceof HTMLElement && !!event.target.closest('input,textarea,select,[contenteditable="true"]')
    if (event.key === '/' && !editable && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); search.current?.focus() }
    if (event.key === 'Escape' && !editable && detailOpen) { event.preventDefault(); back() }
    if (event.altKey && event.key.toLowerCase() === 'r') { event.preventDefault(); if (!busy) void repo.refresh() }
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) && event.target instanceof HTMLElement && event.target.closest('.gv-list-focus')) {
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.gv-list-focus') ?? [])
      const at = buttons.indexOf(event.target.closest('.gv-list-focus') as HTMLButtonElement)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, at + (event.key === 'ArrowDown' ? 1 : -1)))
      event.preventDefault(); buttons[next]?.focus()
    }
  }}>
    <header className="gv-header">
      <div className="gv-heading"><span className="gv-brand-icon"><GitIcon size={21}/></span><strong>源代码管理</strong><span className="gv-version">Git</span><button className="gv-icon-btn" aria-label="刷新 Git" title="刷新仓库 · Alt+R" disabled={!!busy || loading || !workspace} onClick={() => void repo.refresh()}><Icon name="refresh" className={loading ? 'gv-spin' : ''}/></button></div>
      <div className="gv-toolbar"><label className="gv-project-label" htmlFor={id + '-project'}>项目</label><select id={id + '-project'} className="gv-project" aria-label="项目工作区" value={workspace} disabled={!!busy} onChange={event => { repo.chooseWorkspace(event.target.value); reset(); setFileQuery(''); setCommitQuery('') }}>
        {!repo.workspaces.length && <option value="">{loading ? '正在读取项目…' : '没有可用的项目'}</option>}{repo.workspaces.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select></div>
      {data && <div className="gv-summary"><span className="gv-branch" title={data.branch}><GitIcon size={13}/><span>{data.branch || 'HEAD'}</span></span><span className={data.files.length ? 'gv-dirty' : 'gv-clean'}><span className="gv-status-dot"/>{data.files.length ? `${data.files.length} 个改动` : '工作区干净'}</span>{(data.ahead > 0 || data.behind > 0) && <span className="gv-tracking" title="相对上游分支">↑{data.ahead} ↓{data.behind}</span>}</div>}
    </header>
    {repo.error && <div className="gv-message gv-error" role="alert"><Icon name="alert"/><div><strong>需要处理</strong><p>{repo.error}</p><button className="gv-text-btn" disabled={!!busy || loading} onClick={() => void repo.refresh()}>刷新仓库</button></div><button className="gv-icon-btn" aria-label="关闭错误" onClick={() => repo.setError('')}><Icon name="close" size={13}/></button></div>}
    {repo.notice && <div className="gv-message gv-success" role="status"><Icon name="check"/><span>{repo.notice}</span><button className="gv-icon-btn" aria-label="关闭提示" onClick={() => repo.setNotice('')}><Icon name="close" size={13}/></button></div>}
    <nav className="gv-tabs" role="tablist" aria-label="Git 视图"><button id={id + '-working-tab'} role="tab" aria-selected={mode === 'working'} aria-controls={id + '-body'} className={mode === 'working' ? 'gv-active' : ''} onClick={() => changeMode('working')}>工作区<span className="gv-number">{data?.files.length ?? 0}</span></button><button id={id + '-history-tab'} role="tab" aria-selected={mode === 'history'} aria-controls={id + '-body'} className={mode === 'history' ? 'gv-active' : ''} onClick={() => changeMode('history')}>提交历史</button></nav>
    {!data ? <div className="gv-empty" role={loading ? 'status' : undefined}><Icon name={loading ? 'refresh' : 'git'} size={36} className={loading ? 'gv-spin' : ''}/><strong>{loading ? '正在读取仓库…' : repo.error ? '暂时无法读取仓库' : '选择一个 Git 项目'}</strong><p>{repo.error ? '检查项目目录后，点击刷新重试。' : repo.workspaces.length ? '从上方选择项目，浏览改动和提交历史。' : '先在 Harness 中添加已有 Git 仓库的项目，再打开此面板。'}</p></div> : <div id={id + '-body'} className="gv-body" role="tabpanel" aria-labelledby={id + (mode === 'working' ? '-working-tab' : '-history-tab')}>
      <aside className="gv-sidebar">
        <div className="gv-search"><Icon name="search" size={15}/><input ref={search} aria-label={mode === 'working' ? '搜索文件' : '搜索提交'} value={query} placeholder={mode === 'working' ? '搜索文件或路径…' : '搜索提交、作者或哈希…'} onChange={event => mode === 'working' ? setFileQuery(event.target.value) : setCommitQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); mode === 'working' ? setFileQuery('') : setCommitQuery('') } }}/>{query ? <button className="gv-icon-btn" aria-label="清除搜索" onClick={() => mode === 'working' ? setFileQuery('') : setCommitQuery('')}><Icon name="close" size={12}/></button> : <kbd>/</kbd>}</div>
        {mode === 'working' ? <>
          {!!picked.size && <div className="gv-bulk-bar"><span>已选择 {picked.size} 项{hiddenPicked > 0 && <small> · {hiddenPicked} 项在筛选之外</small>}</span>{pickedWorking.length > 0 && <button disabled={disabled} onClick={() => void write({ action: 'stage', paths: pickedWorking.map(file => file.path) })}>暂存 {pickedWorking.length} 项</button>}{pickedStaged.length > 0 && <button disabled={disabled} onClick={() => void write({ action: 'unstage', paths: pickedStaged.map(file => file.path) })}>取消暂存 {pickedStaged.length} 项</button>}<button className="gv-icon-btn" aria-label="取消选择" onClick={() => setPicked(new Set())}><Icon name="close" size={12}/></button></div>}
          <div className="gv-file-scroll">{!data.files.length ? <div className="gv-clean-state"><span><Icon name="check" size={26}/></span><strong>所有改动已提交</strong><p>工作区干净，可以继续开发。</p></div> : <>
            <FileGroup mode="staged" items={shownStaged} allCount={staged.length} selected={picked} onToggle={toggle} onToggleAll={toggleAll} onView={file => chooseFile(file, 'staged')} onWrite={request => void write(request)} current={selection} disabled={disabled} filtered={!!normalized}/>
            <FileGroup mode="working" items={shownWorking} allCount={working.length} selected={picked} onToggle={toggle} onToggleAll={toggleAll} onView={file => chooseFile(file, 'working')} onWrite={request => void write(request)} current={selection} disabled={disabled} filtered={!!normalized}/>
          </>}{normalized && !shownStaged.length && !shownWorking.length && data.files.length > 0 && <div className="gv-filter-empty"><p>没有找到“{query}”</p><button onClick={() => setFileQuery('')}>清除搜索</button></div>}{data.filesTruncated && <div className="gv-diff-note">文件列表过大，当前显示部分文件。</div>}</div>
          <div className="gv-commit-form"><label htmlFor={id + '-message'}>提交说明{message && <span>草稿已保存</span>}</label><textarea id={id + '-message'} aria-label="提交说明" placeholder="简要描述这次修改…" value={message} maxLength={20_000} disabled={!!busy} onChange={event => setMessage(event.target.value)} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); if (!disabled && staged.length && message.trim()) void write({ action: 'commit', message }) } }}/><div className="gv-commit-hint">{!staged.length ? '先暂存需要提交的文件' : `只提交暂存区中的 ${staged.length} 个文件`}<kbd>⌘ / Ctrl ↵</kbd></div><button className="gv-primary gv-submit" disabled={disabled || !staged.length || !message.trim()} onClick={() => void write({ action: 'commit', message })}><Icon name={busy === '提交' ? 'refresh' : 'commit'} className={busy === '提交' ? 'gv-spin' : ''}/>{busy === '提交' ? '正在提交…' : staged.length ? `提交 ${staged.length} 个文件` : '提交'}</button></div>
        </> : <>
          <div className="gv-history-filter"><GitIcon size={14}/><select aria-label="查看分支" value={ref} disabled={!!busy} onChange={event => { repo.setRef(event.target.value); repo.setLimit(100); setHash(''); setSelection(null); setDetailOpen(false) }}><option value="">所有分支</option><optgroup label="本地分支">{data.branches.filter(branch => !branch.remote).map(branch => <option key={branch.ref} value={branch.ref}>{branch.current ? '● ' : ''}{branch.name}</option>)}</optgroup><optgroup label="远程分支">{data.branches.filter(branch => branch.remote).map(branch => <option key={branch.ref} value={branch.ref}>{branch.name}</option>)}</optgroup></select>{viewingBranch && !viewingBranch.remote && !viewingBranch.current && <button disabled={disabled} title={`切换到 ${viewingBranch.name}`} onClick={() => setConfirm(viewingBranch.ref)}>切换</button>}</div>
          <div className="gv-history-caption">{normalized ? `匹配 ${commits.length} / ${data.commits.length} 个已加载提交` : `最近 ${data.commits.length} 个提交`}<span>{normalized ? '搜索结果' : '提交图'}</span></div>
          <div className="gv-history-scroll">{commits.length ? commits.map(({ commit, index }) => <button className={'gv-commit-row gv-list-focus' + (hash === commit.hash ? ' gv-selected' : '')} aria-pressed={hash === commit.hash} key={commit.hash} title={commit.subject} onClick={() => { setHash(commit.hash); setDetailOpen(true) }}>{normalized ? <span className="gv-search-dot"/> : <Graph row={graph.rows[index]} width={Math.max(40, Math.min(180, graph.lanes * 14 + 18))}/>}<span className="gv-commit-copy"><span className="gv-subject">{commit.subject || '（无提交说明）'}</span><span className="gv-commit-meta"><span className="gv-author">{commit.author}</span><time dateTime={commit.date}>{dateLabel(commit.date)}</time><span className="gv-hash">{commit.hash.slice(0, 7)}</span></span>{commit.refs && <span className="gv-ref" title={commit.refs}>{commit.refs.replace(/^HEAD -> /, '')}</span>}</span></button>) : <div className="gv-empty"><Icon name="commit" size={30}/><strong>{normalized ? '没有匹配的提交' : '还没有提交'}</strong><p>{normalized ? '试试提交说明、作者或哈希。搜索范围是当前已加载的历史。' : '暂存文件并创建第一个提交后，历史会出现在这里。'}</p>{normalized && <button onClick={() => setCommitQuery('')}>清除搜索</button>}</div>}{data.moreCommits && limit < 500 && <button className="gv-load-more" disabled={loading} onClick={() => repo.setLimit(value => Math.min(500, value + 100))}>{loading ? '正在加载…' : '再加载 100 个提交'}</button>}</div>
        </>}
      </aside>
      <section className="gv-detail" aria-label="差异详情">
        <div className="gv-detail-head"><button className="gv-icon-btn gv-back" aria-label="返回列表" title="返回列表 · Esc" onClick={back}><Icon name="back"/></button><span className="gv-detail-name"><strong title={selection?.path}>{selectedName ?? (mode === 'history' ? '提交详情' : '文件差异')}</strong>{selectedPath && <small title={selectedPath}>{selectedPath}</small>}</span><span className="gv-mode">{selection?.mode === 'staged' ? '已暂存' : selection?.mode === 'working' ? '工作区' : mode === 'history' ? '提交' : ''}</span>{selection && mode === 'working' && <button className="gv-detail-action" disabled={disabled} onClick={() => void write({ action: selection.mode === 'staged' ? 'unstage' : 'stage', paths: [selection.path] })}><Icon name={selection.mode === 'staged' ? 'minus' : 'plus'} size={14}/>{selection.mode === 'staged' ? '取消暂存' : '暂存文件'}</button>}</div>
        {mode === 'history' && detail && <div className="gv-commit-card"><div className="gv-commit-title"><Icon name="commit"/><strong>{detail.commit.subject}</strong></div><div className="gv-commit-info"><button className="gv-copy-hash" title="复制完整提交哈希" onClick={() => void copyHash()}>{detail.commit.hash.slice(0, 10)}<Icon name="copy" size={12}/></button><span>{detail.commit.author}</span><time dateTime={detail.commit.date}>{dateLabel(detail.commit.date)}</time></div>{detail.message !== detail.commit.subject && <pre>{detail.message}</pre>}<label className="gv-commit-file-label">修改文件<span className="gv-number">{detail.files.length}</span><select aria-label="提交中的文件" value={selection?.path ?? ''} onChange={event => setSelection({ path: event.target.value, mode: 'commit', hash })}>{!detail.files.length && <option value="">这个提交没有文件差异</option>}{detail.files.map(file => <option key={file.path} value={file.path}>{STATUS[file.status[0]] ?? file.status} · {file.path}</option>)}</select></label></div>}
        <DiffView value={patch} loading={patchLoading || detailLoading} selected={!!selection} onMessage={repo.setNotice}/>
      </section>
    </div>}
    <footer className="gv-footer"><span title={data?.root}>{busy ? <><Icon name="refresh" className="gv-spin" size={12}/>正在{busy}…</> : repo.outdated ? <><Icon name="alert" size={12}/>状态需要刷新</> : loading ? '正在刷新…' : repo.updatedAt ? '已更新 ' + new Date(repo.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '本地 Git'}</span><span className="gv-footer-root" title={data?.root}>{data?.root.split('/').pop()}</span><span>{data?.head?.slice(0, 8) ?? '尚无提交'}</span></footer>
    {confirm && <BranchDialog from={data?.branch ?? ''} to={data?.branches.find(branch => branch.ref === confirm)?.name ?? confirm} changes={data?.files.length ?? 0} onCancel={() => setConfirm(null)} onConfirm={() => { const next = confirm; setConfirm(null); void write({ action: 'switch', ref: next }) }}/>}
  </div>
}
