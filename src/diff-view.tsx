import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { GitDiff } from './types.js'
import { parseDiff, splitDiff } from './diff-model.js'
import { GitIcon, Icon } from './icons.js'

export function DiffView({ value, loading, selected = false, onMessage }: { value: GitDiff | null; loading: boolean; selected?: boolean; onMessage?(message: string): void }) {
  const [view, setView] = useState<'unified' | 'split'>('unified'), [wrap, setWrap] = useState(true), [headers, setHeaders] = useState(false), [hunk, setHunk] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const parsed = useMemo(() => parseDiff(value?.patch ?? ''), [value?.patch])
  const lines = useMemo(() => parsed.lines.filter(line => headers || line.kind !== 'meta').slice(0, 2000), [parsed, headers])
  const split = useMemo(() => splitDiff(lines), [lines])
  const hunks = lines.filter(line => line.kind === 'hunk')
  useEffect(() => { setHunk(0); if (scroller.current) scroller.current.scrollTop = 0 }, [value?.patch])
  const jump = (next: number) => {
    if (!hunks.length) return
    const index = Math.max(0, Math.min(hunks.length - 1, next)); setHunk(index)
    const root = scroller.current, row = root?.querySelector<HTMLElement>(`[data-hunk="${hunks[index].id}"]`)
    if (root && row) root.scrollTo({ top: row.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 28, behavior: 'smooth' })
  }
  if (loading) return <div className="gv-empty" role="status"><Icon name="refresh" className="gv-spin" size={25}/><strong>正在读取差异…</strong></div>
  if (!value || !value.patch) return <div className="gv-empty"><GitIcon size={34}/><strong>{selected ? '没有可显示的文本差异' : '选择文件查看差异'}</strong><p>{selected ? '文件可能没有文本改动，或其状态已经变化。' : '点击文件可查看修改，使用 + 按钮将它加入暂存区。'}</p></div>
  if (value.binary) return <div className="gv-empty"><Icon name="file" size={34}/><strong>二进制文件</strong><p>可以暂存和提交此文件，当前不提供文本差异预览。</p></div>
  if (!parsed.hunks && !/^(diff |--- |Binary )/m.test(value.patch)) return <div className="gv-empty"><Icon name="file" size={30}/><p>{value.patch}</p></div>
  const copy = async () => {
    try { await navigator.clipboard.writeText(value.patch); onMessage?.('差异已复制') }
    catch { onMessage?.('无法访问剪贴板，请在差异中选择并复制文本。') }
  }
  return <>
    <div className="gv-diff-toolbar">
      <div className="gv-diff-stats" aria-label={`增加 ${parsed.added} 行，删除 ${parsed.deleted} 行`}><span className="gv-added">+{parsed.added}</span><span className="gv-deleted">−{parsed.deleted}</span></div>
      <div className="gv-segment" aria-label="差异显示方式"><button aria-pressed={view === 'unified'} onClick={() => setView('unified')}>统一</button><button aria-pressed={view === 'split'} onClick={() => setView('split')}>并排</button></div>
      <span className="gv-toolbar-spacer"/>
      <button className="gv-icon-btn" aria-label="自动换行" aria-pressed={wrap} title="自动换行" onClick={() => setWrap(value => !value)}><Icon name="wrap"/></button>
      <button className="gv-icon-btn" aria-label="显示 Git 头信息" aria-pressed={headers} title="显示 Git 头信息" onClick={() => setHeaders(value => !value)}><span className="gv-code-glyph">···</span></button>
      <button className="gv-icon-btn" aria-label="复制差异" title="复制差异" onClick={() => void copy()}><Icon name="copy"/></button>
      {hunks.length > 0 && <div className="gv-hunk-nav"><span>{hunk + 1}/{hunks.length}</span><button className="gv-icon-btn" aria-label="上一处修改" disabled={hunk === 0} onClick={() => jump(hunk - 1)}><Icon name="up"/></button><button className="gv-icon-btn" aria-label="下一处修改" disabled={hunk >= hunks.length - 1} onClick={() => jump(hunk + 1)}><Icon name="down"/></button></div>}
    </div>
    <div ref={scroller} className={`gv-diff${wrap ? ' gv-wrap' : ''}${view === 'split' ? ' gv-diff-split' : ''}`} aria-label="文件差异" tabIndex={0}>
      <table className="gv-diff-table"><colgroup><col style={{ width: 35 }}/>{view === 'unified' ? <><col style={{ width: 35 }}/><col/></> : <><col className="gv-code-column"/><col style={{ width: 35 }}/><col className="gv-code-column"/></>}</colgroup><thead>{view === 'unified' ? <tr><th className="gv-num">旧</th><th className="gv-num">新</th><th className="gv-code-heading">修改内容</th></tr> : <tr><th colSpan={2}>修改前</th><th colSpan={2}>修改后</th></tr>}</thead><tbody>
        {view === 'unified' ? lines.map(line => <tr key={line.id} className={`gv-diff-${line.kind}`} data-hunk={line.kind === 'hunk' ? line.id : undefined}><td className="gv-num">{line.old}</td><td className="gv-num">{line.next}</td><td className="gv-code">{line.text}</td></tr>)
          : split.map(row => row.header ? <tr key={row.id} className={`gv-diff-${row.header.kind}`} data-hunk={row.header.kind === 'hunk' ? row.header.id : undefined}><td colSpan={4} className="gv-code">{row.header.text}</td></tr> : <tr key={row.id}><td className={`gv-num gv-diff-${row.left?.kind ?? 'blank'}`}>{row.left?.old}</td><td className={`gv-code gv-diff-${row.left?.kind ?? 'blank'}`}>{row.left?.text.slice(1)}</td><td className={`gv-num gv-diff-${row.right?.kind ?? 'blank'}`}>{row.right?.next}</td><td className={`gv-code gv-diff-${row.right?.kind ?? 'blank'}`}>{row.right?.text.slice(1)}</td></tr>)}
      </tbody></table>
      {lines.length === 0 && <div className="gv-empty-small">此修改仅包含文件属性或路径变化。<button onClick={() => setHeaders(true)}>显示详细信息</button></div>}
      {(value.truncated || parsed.lines.filter(line => headers || line.kind !== 'meta').length > 2000) && <div className="gv-diff-note">差异较大，已截取前面的内容。</div>}
    </div>
  </>
}
