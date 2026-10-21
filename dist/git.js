import { spawn } from 'node:child_process';
import { lstat, open, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { StringDecoder } from 'node:string_decoder';
export class GitError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'GitError';
    }
}
const FORMAT = '%H%x00%P%x00%an%x00%aI%x00%s%x00%D';
const MAX_BYTES = 2_000_000;
const mutations = new Map();
export async function runGit(cwd, args, signal, input) {
    signal?.throwIfAborted();
    return new Promise((done, reject) => {
        const env = { ...process.env, LC_ALL: 'C', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_PAGER: 'cat', GIT_EDITOR: 'true' };
        for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES'])
            delete env[key];
        const child = spawn('git', ['--no-pager', '--literal-pathspecs', '-c', 'color.ui=false', '-c', 'core.quotepath=false', '-c', 'core.fsmonitor=false', ...args], {
            cwd, shell: false, windowsHide: true, detached: process.platform !== 'win32', env,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let output = '', error = '', bytes = 0, truncated = false, timedOut = false;
        const decoder = new StringDecoder('utf8');
        let force;
        const stop = (kind) => {
            try {
                if (process.platform !== 'win32' && child.pid)
                    process.kill(-child.pid, kind);
                else
                    child.kill(kind);
            }
            catch { }
        };
        const kill = () => { stop('SIGTERM'); force ??= setTimeout(() => stop('SIGKILL'), 2000); };
        const timeout = setTimeout(() => { timedOut = true; kill(); }, input === undefined ? 15_000 : 60_000);
        const abort = () => kill();
        signal?.addEventListener('abort', abort, { once: true });
        child.stdout.on('data', (chunk) => {
            const remaining = MAX_BYTES - bytes;
            if (remaining > 0) {
                output += decoder.write(chunk.subarray(0, remaining));
                bytes += Math.min(remaining, chunk.length);
            }
            if (chunk.length > remaining) {
                truncated = true;
                kill();
            }
        });
        child.stderr.on('data', (chunk) => { if (error.length < 20_000)
            error += chunk.toString(); });
        child.stdin.on('error', () => { });
        child.once('error', error => { clearTimeout(timeout); signal?.removeEventListener('abort', abort); reject(error); });
        child.once('close', code => {
            clearTimeout(timeout);
            clearTimeout(force);
            signal?.removeEventListener('abort', abort);
            output += decoder.end();
            if (signal?.aborted) {
                reject(signal.reason);
                return;
            }
            if (timedOut) {
                reject(new GitError('TIMEOUT', 'Git 操作超时，请检查仓库、提交钩子或签名配置。'));
                return;
            }
            if (code !== 0 && !truncated) {
                reject(new GitError('GIT_FAILED', error.trim() || 'Git 命令执行失败'));
                return;
            }
            done({ output, truncated, code: code ?? -1 });
        });
        child.stdin.end(input);
    });
}
export function parseStatus(raw) {
    const parts = raw.split('\0'), files = [];
    let header = '';
    for (let i = 0; i < parts.length; i++) {
        const entry = parts[i];
        if (entry.startsWith('## ')) {
            header = entry.slice(3);
            continue;
        }
        if (entry.length < 4)
            continue;
        const index = entry[0], worktree = entry[1], path = entry.slice(3);
        const oldPath = 'RC'.includes(index) || 'RC'.includes(worktree) ? parts[++i] : undefined;
        files.push({ path, index, worktree, ...(oldPath ? { oldPath } : {}) });
    }
    const branch = header.replace(/^No commits yet on |^Initial commit on /, '').split('...')[0].replace(/ \[.*$/, '');
    return { branch, ahead: Number(header.match(/ahead (\d+)/)?.[1] ?? 0), behind: Number(header.match(/behind (\d+)/)?.[1] ?? 0), files };
}
export function parseLog(raw) {
    const parts = raw.split('\0'), commits = [];
    for (let i = 0; i + 5 < parts.length; i += 6) {
        const hash = parts[i].trim();
        if (!/^[a-f\d]{40,64}$/.test(hash))
            continue;
        commits.push({ hash, parents: parts[i + 1] ? parts[i + 1].split(' ') : [], author: parts[i + 2], date: parts[i + 3], subject: parts[i + 4], refs: parts[i + 5] });
    }
    return commits;
}
export async function repositoryRoot(path, signal) {
    try {
        return (await runGit(path, ['rev-parse', '--show-toplevel'], signal)).output.trimEnd();
    }
    catch (error) {
        if (error instanceof GitError && /not a git repository|must be run in a work tree/i.test(error.message))
            throw new GitError('NOT_REPOSITORY', '这个工作目录不是 Git 工作区。请选择已有 Git 仓库的项目。');
        throw error;
    }
}
async function head(root, signal) {
    try {
        return (await runGit(root, ['rev-parse', '--verify', 'HEAD'], signal)).output.trim();
    }
    catch (error) {
        if (error instanceof GitError && /Needed a single revision|unknown revision|bad revision/i.test(error.message))
            return null;
        throw error;
    }
}
async function branches(root, signal) {
    const result = await runGit(root, ['for-each-ref', '--format=%(refname)%00%(refname:short)%00%(objectname)%00%(upstream:short)%00%(HEAD)', 'refs/heads/', 'refs/remotes/'], signal);
    return result.output.trimEnd().split('\n').filter(Boolean).map(line => {
        const [ref, name, hash, upstream, current] = line.split('\0');
        return { ref, name, hash, upstream, current: current === '*', remote: ref.startsWith('refs/remotes/') };
    });
}
export async function snapshot(root, request, signal) {
    const limit = Math.max(20, Math.min(500, Number.isSafeInteger(request.limit) ? request.limit : 100));
    const [status, refs, currentHead] = await Promise.all([
        runGit(root, ['status', '--porcelain=v1', '-z', '--branch', '--untracked-files=all'], signal), branches(root, signal), head(root, signal),
    ]);
    if (request.ref && !refs.some(ref => ref.ref === request.ref))
        throw new GitError('UNKNOWN_BRANCH', '分支已变化，请刷新后重新选择。');
    const log = currentHead || refs.length ? await runGit(root, ['log', '--topo-order', `--max-count=${limit + 1}`, `--format=${FORMAT}`, '-z', ...(request.ref ? [request.ref] : ['--all'])], signal) : { output: '', truncated: false };
    const commits = parseLog(log.output), parsed = parseStatus(status.output);
    return { root, ...parsed, head: currentHead, branches: refs, commits: commits.slice(0, limit), moreCommits: commits.length > limit || log.truncated, filesTruncated: status.truncated };
}
function safePath(path) {
    if (typeof path !== 'string' || !path || path.includes('\0') || isAbsolute(path) || path.split(/[\\/]/).some(part => part === '..') || path.split(/[\\/]/)[0] === '.git')
        throw new GitError('INVALID_PATH', '文件路径无效。');
    return path;
}
async function commitInfo(root, hash, signal) {
    if (typeof hash !== 'string' || !/^[a-f\d]{40,64}$/.test(hash))
        throw new GitError('INVALID_COMMIT', '提交标识无效。');
    const result = await runGit(root, ['show', '--no-patch', `--format=${FORMAT}%x00`, hash], signal);
    const info = parseLog(result.output)[0];
    if (!info)
        throw new GitError('INVALID_COMMIT', '找不到这个提交。');
    return info;
}
function parseNames(raw) {
    const parts = raw.split('\0'), files = [];
    for (let i = 0; i < parts.length && parts[i];) {
        const status = parts[i++], first = parts[i++];
        if (!first)
            break;
        if (/^[RC]/.test(status)) {
            const path = parts[i++];
            if (path)
                files.push({ path, oldPath: first, status });
        }
        else
            files.push({ path: first, status });
    }
    return files;
}
export async function commitDetail(root, hash, signal) {
    const commit = await commitInfo(root, hash, signal);
    const [message, files] = await Promise.all([
        runGit(root, ['show', '--no-patch', '--format=%B', commit.hash], signal),
        runGit(root, commit.parents.length ? ['diff', '--no-ext-diff', '--no-textconv', '--name-status', '-z', commit.parents[0], commit.hash] : ['diff-tree', '--root', '--no-commit-id', '-r', '--name-status', '-z', commit.hash], signal),
    ]);
    return { commit, message: message.output.trimEnd(), files: parseNames(files.output) };
}
export async function diff(root, request, signal) {
    const path = safePath(request.path);
    if (request.mode === 'commit') {
        const info = await commitInfo(root, request.hash, signal);
        const result = await runGit(root, info.parents.length
            ? ['diff', '--no-ext-diff', '--no-textconv', '--submodule=short', '--unified=4', info.parents[0], info.hash, '--', path]
            : ['show', '--format=', '--no-ext-diff', '--no-textconv', '--submodule=short', '--unified=4', info.hash, '--', path], signal);
        return { patch: result.output, truncated: result.truncated, binary: result.output.includes('Binary files ') };
    }
    const status = parseStatus((await runGit(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], signal)).output);
    const file = status.files.find(file => file.path === path);
    if (!file)
        throw new GitError('FILE_CHANGED', '文件状态已变化，请刷新。');
    if (file.index === '?' && request.mode !== 'staged') {
        // Read previews only inside the repository; do not follow untracked symlinks.
        const absolute = resolve(root, path), info = await lstat(absolute);
        if (!info.isFile() || info.isSymbolicLink())
            return { patch: '这个条目不是普通文件，无法显示文本差异。', binary: false, truncated: false };
        const canonical = await realpath(absolute), within = relative(root, canonical);
        if (within === '..' || within.startsWith('..' + sep) || isAbsolute(within))
            throw new GitError('INVALID_PATH', '文件不在仓库中。');
        const handle = await open(canonical, 'r');
        try {
            const buffer = Buffer.alloc(Math.min(info.size, 200_000));
            const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
            const content = buffer.subarray(0, bytesRead);
            if (content.includes(0))
                return { patch: '二进制文件，无法显示文本差异。', binary: true, truncated: false };
            const lines = content.toString('utf8').split('\n');
            return { patch: `--- /dev/null\n+++ b/${path}\n@@ -0,0 +1,${lines.length} @@\n` + lines.map(line => '+' + line).join('\n'), binary: false, truncated: info.size > buffer.length };
        }
        finally {
            await handle.close();
        }
    }
    const paths = [path, ...(file.oldPath ? [file.oldPath] : [])];
    const result = await runGit(root, ['diff', '--no-ext-diff', '--no-textconv', '--submodule=short', '--unified=4', ...(request.mode === 'staged' ? ['--cached'] : []), '--', ...paths], signal);
    return { patch: result.output, truncated: result.truncated, binary: result.output.includes('Binary files ') };
}
/** One write at a time per repository; the caller must act on the displayed HEAD. */
export async function mutate(root, request, signal) {
    const previous = mutations.get(root) ?? Promise.resolve();
    const operation = previous.catch(() => { }).then(async () => {
        signal?.throwIfAborted();
        const currentHead = await head(root, signal);
        if (request.expectedHead !== currentHead)
            throw new GitError('STALE_HEAD', '仓库提交已变化，请先刷新后重试。');
        if (request.action === 'switch') {
            const refs = await branches(root, signal);
            const branch = refs.find(branch => !branch.remote && branch.ref === request.ref);
            if (!branch)
                throw new GitError('UNKNOWN_BRANCH', '只能切换到已有的本地分支。');
            await runGit(root, ['switch', '--no-guess', '--', branch.ref.slice('refs/heads/'.length)], signal);
            return { message: `已切换到 ${branch.name}` };
        }
        if (request.action === 'commit') {
            if (typeof request.message !== 'string' || !request.message.trim() || request.message.length > 20_000 || request.message.includes('\0'))
                throw new GitError('INVALID_MESSAGE', '请输入有效的提交说明（不超过 20000 字符）。');
            const status = parseStatus((await runGit(root, ['status', '--porcelain=v1', '-z'], signal)).output);
            if (!status.files.some(file => ![' ', '?', '!'].includes(file.index)))
                throw new GitError('NOTHING_STAGED', '暂存区为空，请先暂存要提交的文件。');
            await runGit(root, ['commit', '--file=-'], signal, request.message);
            return { message: '提交完成' };
        }
        if (request.action !== 'stage' && request.action !== 'unstage')
            throw new GitError('INVALID_ACTION', '操作无效。');
        if (!Array.isArray(request.paths) || request.paths.length < 1 || request.paths.length > 2000)
            throw new GitError('INVALID_PATH', '请选择 1 到 2000 个文件。');
        const status = parseStatus((await runGit(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], signal)).output);
        const paths = new Set();
        for (const requested of request.paths) {
            const path = safePath(requested), file = status.files.find(file => file.path === path);
            if (!file)
                throw new GitError('FILE_CHANGED', '文件状态已变化，请刷新。');
            paths.add(path);
            if (file.oldPath && (request.action === 'unstage' || 'RC'.includes(file.worktree)))
                paths.add(safePath(file.oldPath));
        }
        await runGit(root, request.action === 'stage' ? ['add', '--', ...paths]
            : currentHead ? ['restore', '--staged', '--', ...paths] : ['rm', '--cached', '--', ...paths], signal);
        return { message: request.action === 'stage' ? '已暂存所选文件' : '已取消暂存' };
    });
    mutations.set(root, operation);
    try {
        return await operation;
    }
    finally {
        if (mutations.get(root) === operation)
            mutations.delete(root);
    }
}
