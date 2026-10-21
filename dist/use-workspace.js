import { useCallback, useEffect, useRef, useState } from 'react';
export const errorText = (error) => error instanceof Error ? error.message : String(error);
const actionNames = { stage: '暂存', unstage: '取消暂存', commit: '提交', switch: '切换分支' };
export function useWorkspace(call, sessionId) {
    const [workspaces, setWorkspaces] = useState([]);
    const [workspace, setWorkspace] = useState(''), [data, setData] = useState(null);
    const [ref, setRef] = useState(''), [limit, setLimit] = useState(100);
    const [loading, setLoading] = useState(true), [busy, setBusy] = useState('');
    const [error, setError] = useState(''), [notice, setNotice] = useState(''), [outdated, setOutdated] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(null);
    const alive = useRef(true), generation = useRef(0), writing = useRef(false);
    useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current++; }; }, []);
    const reloadWorkspaces = useCallback(async (signal) => {
        setLoading(true);
        try {
            const result = await call({ action: 'workspaces', sessionId }, signal);
            if (signal?.aborted || !alive.current)
                return;
            setWorkspaces(result.workspaces);
            setWorkspace(result.selected ?? result.workspaces[0]?.id ?? '');
            setError('');
            if (!result.workspaces.length)
                setLoading(false);
        }
        catch (error) {
            if (!signal?.aborted && alive.current) {
                setError(errorText(error));
                setLoading(false);
            }
        }
    }, [call, sessionId]);
    useEffect(() => { const controller = new AbortController(); void reloadWorkspaces(controller.signal); return () => controller.abort(); }, [reloadWorkspaces]);
    const refresh = useCallback(async (signal) => {
        if (!workspace)
            return null;
        const token = ++generation.current;
        setLoading(true);
        try {
            const result = await call({ action: 'snapshot', workspaceId: workspace, ref: ref || undefined, limit }, signal);
            if (!alive.current || signal?.aborted || generation.current !== token)
                return null;
            setData(result);
            setError('');
            setOutdated(false);
            setUpdatedAt(Date.now());
            return result;
        }
        catch (error) {
            if (alive.current && !signal?.aborted && generation.current === token) {
                setError(errorText(error));
                setOutdated(true);
            }
            return null;
        }
        finally {
            if (alive.current && !signal?.aborted && generation.current === token)
                setLoading(false);
        }
    }, [call, workspace, ref, limit]);
    useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort(); }, [refresh]);
    useEffect(() => {
        const onFocus = () => { if (!writing.current)
            void refresh(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [refresh]);
    useEffect(() => {
        if (!notice)
            return;
        const timer = setTimeout(() => setNotice(''), 5000);
        return () => clearTimeout(timer);
    }, [notice]);
    const chooseWorkspace = (id) => {
        generation.current++;
        setWorkspace(id);
        setData(null);
        setRef('');
        setLimit(100);
        setError('');
        setNotice('');
        setOutdated(false);
        setUpdatedAt(null);
    };
    const mutate = async (request) => {
        if (!data || writing.current || loading || outdated)
            return false;
        writing.current = true;
        const label = actionNames[request.action] ?? '操作';
        setBusy(label);
        setError('');
        setNotice('');
        let succeeded = false;
        try {
            await call({ ...request, workspaceId: workspace, expectedHead: data.head });
            succeeded = true;
            if (!alive.current)
                return true;
            const result = await refresh();
            if (!alive.current)
                return true;
            const count = request.paths?.length ?? 0;
            const message = request.action === 'stage' ? `已暂存 ${count} 个文件` : request.action === 'unstage' ? `已取消暂存 ${count} 个文件` : request.action === 'commit' ? '提交完成' : '已切换分支';
            setNotice(message);
            if (!result)
                setError(`${label}已完成，但状态刷新失败。请刷新仓库后继续操作。`);
            return true;
        }
        catch (error) {
            if (alive.current)
                setError(`${label}失败：${errorText(error)}`);
            return succeeded;
        }
        finally {
            writing.current = false;
            if (alive.current)
                setBusy('');
        }
    };
    return { workspaces, workspace, data, ref, setRef, limit, setLimit, loading, busy, error, setError, notice, setNotice, outdated, updatedAt, chooseWorkspace, refresh: () => workspace ? refresh() : reloadWorkspaces(), mutate };
}
