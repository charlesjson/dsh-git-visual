import React, { useEffect, useId, useRef } from 'react'
import { Icon } from './icons.js'

export function BranchDialog({ from, to, changes, onCancel, onConfirm }: { from: string; to: string; changes: number; onCancel(): void; onConfirm(): void }) {
  const dialog = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus() }
  }, [])
  return <div className="gv-modal-cover" onMouseDown={event => { if (event.target === event.currentTarget) onCancel() }}>
    <div ref={dialog} className="gv-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onCancel() }
      if (event.key === 'Tab') {
        const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
        const first = buttons[0], last = buttons.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }}>
      <div className="gv-dialog-heading"><Icon name="git" size={23}/><h3 id={titleId}>切换分支</h3></div>
      <div className="gv-branch-transition"><span title={from}>{from || 'HEAD'}</span><Icon name="chevron"/><strong title={to}>{to}</strong></div>
      <p>{changes ? `当前有 ${changes} 个未提交的文件。Git 会在切换将覆盖本地改动时拒绝操作。` : '工作区干净，可以切换到这个本地分支。'}</p>
      <div className="gv-dialog-actions"><button onClick={onCancel}>取消</button><button className="gv-primary" onClick={onConfirm}><Icon name="git"/>切换分支</button></div>
    </div>
  </div>
}
