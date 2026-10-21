import type { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-workspace'
import { commitDetail, diff, GitError, mutate, repositoryRoot, snapshot } from './git.js'
import type { GitRequest } from './types.js'

export const name = 'git-visual'
export const inject = ['workspaceRegistry', 'typert']

export class GitVisualService extends TypertRemoteService {
  static inject = ['workspaceRegistry']
  constructor(ctx: Context) { super(ctx, 'gitVisual', { namespace: 'gitVisual' }) }

  @Remote
  async request(request: GitRequest, signal: AbortSignal): Promise<unknown> {
    try {
      if (!request || typeof request !== 'object' || Array.isArray(request)) throw new GitError('INVALID_REQUEST', '请求无效。')
      const workspaces = this.ctx.workspaceRegistry.list()
      if (request.action === 'workspaces') return {
        workspaces: workspaces.map(workspace => ({ id: workspace.id, title: workspace.title, path: workspace.path })),
        selected: workspaces.find(workspace => workspace.sessionIds.some(id => id === request.sessionId))?.id,
      }
      const workspace = workspaces.find(workspace => workspace.id === request.workspaceId)
      if (!workspace) throw new GitError('UNKNOWN_WORKSPACE', '请选择 Harness 中已有的项目工作区。')
      const root = await repositoryRoot(workspace.path, signal)
      switch (request.action) {
        case 'snapshot': return await snapshot(root, request, signal)
        case 'diff': return await diff(root, request, signal)
        case 'commitDetail': return await commitDetail(root, request.hash, signal)
        case 'stage': case 'unstage': case 'commit': case 'switch': return await mutate(root, request, signal)
        default: throw new GitError('INVALID_ACTION', '操作无效。')
      }
    } catch (error) {
      if (error instanceof GitError) throw new RemoteError('gateway/internal', error.message, { gitCode: error.code })
      throw error
    }
  }
}

export async function apply(ctx: Context): Promise<void> { await ctx.plugin(GitVisualService) }
