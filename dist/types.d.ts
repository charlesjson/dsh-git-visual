export interface GitFile {
    path: string;
    oldPath?: string;
    index: string;
    worktree: string;
}
export interface GitCommit {
    hash: string;
    parents: string[];
    author: string;
    date: string;
    subject: string;
    refs: string;
}
export interface GitBranch {
    ref: string;
    name: string;
    hash: string;
    upstream: string;
    current: boolean;
    remote: boolean;
}
export interface GitSnapshot {
    root: string;
    branch: string;
    head: string | null;
    ahead: number;
    behind: number;
    files: GitFile[];
    branches: GitBranch[];
    commits: GitCommit[];
    moreCommits: boolean;
    filesTruncated: boolean;
}
export interface GitDiff {
    patch: string;
    truncated: boolean;
    binary: boolean;
}
export interface GitCommitDetail {
    commit: GitCommit;
    message: string;
    files: {
        path: string;
        oldPath?: string;
        status: string;
    }[];
}
export interface GitRequest {
    action: 'workspaces' | 'snapshot' | 'diff' | 'commitDetail' | 'stage' | 'unstage' | 'commit' | 'switch';
    workspaceId?: string;
    sessionId?: string;
    ref?: string;
    limit?: number;
    path?: string;
    mode?: 'working' | 'staged' | 'commit';
    hash?: string;
    paths?: string[];
    message?: string;
    expectedHead?: string | null;
}
export type GitCall = <T>(request: GitRequest, signal?: AbortSignal) => Promise<T>;
