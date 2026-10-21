import React from 'react'
import type { GitCall, GitRequest } from './types.js'
import { GitIcon, GitPanel } from './panel.js'
import { css } from './styles.js'

type Dispose = () => void
interface ClientContext {
  effect(effect: () => unknown, label?: string): unknown
  slots: { inject(name: string, effect: () => unknown): Dispose; register(options: object, component: Function): Dispose }
  sidebarRightTabs: { register(definition: object): Dispose }
  connection: { rpc: { call(path: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{ ok: boolean; value?: unknown; error?: { message: string } }> } }
}
interface GuideProps { useTabInfo(): { tab: { actions: { openTab(kind: string, options: object): void } } } }
export const inject = ['slots', 'sidebarRightTabs', 'sidebarRight', 'connection']
export const name = 'git-visual-client'

function GitGuide({ useTabInfo }: GuideProps) {
  const { tab } = useTabInfo()
  return <button className="gv-guide" onClick={() => tab.actions.openTab('git-visual', { replaceTab: true })}><GitIcon size={28}/><span><strong>Git 仓库</strong><small>提交图、文件差异、暂存和提交</small></span></button>
}
function GitTitle() { return <span className="gv-tab-title"><GitIcon size={15}/>Git</span> }

export function apply(ctx: ClientContext): void {
  const id = 'dsh-git-visual'
  ctx.effect(() => {
    const style = document.createElement('style'); style.dataset.plugin = id; style.textContent = css; document.head.appendChild(style)
    return () => style.remove()
  }, 'git-visual.styles')
  const call: GitCall = async <T,>(request: GitRequest, signal?: AbortSignal): Promise<T> => {
    const response = await ctx.connection.rpc.call('/api', 'gitVisual/request', { args: { request } }, signal)
    if (!response.ok) throw new Error(response.error?.message ?? 'Git 请求失败')
    return response.value as T
  }
  ctx.effect(() => ctx.sidebarRightTabs.register({ id, kind: 'git-visual', multiple: false, title: () => 'Git', guide: [{ id: 'repository', order: 25, title: () => 'Git 仓库', description: () => '提交图、差异和版本管理', icon: GitIcon }] }), 'git-visual.type')
  ctx.effect(() => ctx.slots.inject('sidebar.right.tab.guide.entry', () => ctx.slots.register({ name: 'sidebar.right.tab.guide.entry', key: id }, GitGuide)), 'git-visual.guide')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: id, inject: (sessionId: string) => ({ call, sessionId }) }, GitPanel)), 'git-visual.body')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: id }, GitTitle)), 'git-visual.title')
}
