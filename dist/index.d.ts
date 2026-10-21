import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { GitRequest } from './types.js';
export declare const name = "git-visual";
export declare const inject: string[];
export declare class GitVisualService extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    request(request: GitRequest, signal: AbortSignal): Promise<unknown>;
}
export declare function apply(ctx: Context): Promise<void>;
