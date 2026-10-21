import type { GitCommit, GitCommitDetail, GitDiff, GitFile, GitRequest, GitSnapshot } from './types.js';
export declare class GitError extends Error {
    code: string;
    constructor(code: string, message: string);
}
export declare function runGit(cwd: string, args: string[], signal?: AbortSignal, input?: string): Promise<{
    output: string;
    truncated: boolean;
    code: number;
}>;
export declare function parseStatus(raw: string): {
    branch: string;
    ahead: number;
    behind: number;
    files: GitFile[];
};
export declare function parseLog(raw: string): GitCommit[];
export declare function repositoryRoot(path: string, signal?: AbortSignal): Promise<string>;
export declare function snapshot(root: string, request: GitRequest, signal?: AbortSignal): Promise<GitSnapshot>;
export declare function commitDetail(root: string, hash: unknown, signal?: AbortSignal): Promise<GitCommitDetail>;
export declare function diff(root: string, request: GitRequest, signal?: AbortSignal): Promise<GitDiff>;
/** One write at a time per repository; the caller must act on the displayed HEAD. */
export declare function mutate(root: string, request: GitRequest, signal?: AbortSignal): Promise<{
    message: string;
}>;
