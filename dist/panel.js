import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { layoutGraph } from './graph.js';
import { GitIcon, Icon } from './icons.js';
import { DiffView } from './diff-view.js';
import { BranchDialog } from './dialog.js';
import { errorText, useWorkspace } from './use-workspace.js';
export { GitIcon, DiffView };
const COLORS = ['#6588ed', '#d19a48', '#58ae93', '#bd7bd0', '#e17c83', '#5aaac1'];
const STATUS = { M: '修改', A: '新增', D: '删除', R: '改名', C: '复制', '?': '未跟踪', U: '冲突', T: '类型变化' };
const conflict = (file) => ['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'].includes(file.index + file.worktree);
const isStaged = (file) => !conflict(file) && ![' ', '?', '!'].includes(file.index);
const isWorking = (file) => conflict(file) || file.worktree !== ' ' || file.index === '?';
const fileKey = (mode, path) => mode + ':' + path;
function dateLabel(date) { const value = new Date(date); return Number.isNaN(value.getTime()) ? '' : value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function readDraft(workspace) { try {
    return workspace ? window.sessionStorage.getItem('dsh-git-visual:draft:' + workspace) ?? '' : '';
}
catch {
    return '';
} }
function Graph({ row, width }) {
    const x = (lane) => 14 + lane * 14;
    return React.createElement("svg", { width: width, height: 62, className: "gv-graph", "aria-hidden": "true" },
        row.through.map((line, i) => React.createElement("path", { key: i, d: `M${x(line.from)} 0 C${x(line.from)} 31 ${x(line.to)} 31 ${x(line.to)} 62`, stroke: COLORS[line.color], strokeWidth: "1.7", fill: "none" })),
        row.incoming && React.createElement("path", { d: `M${x(row.lane)} 0V31`, stroke: COLORS[row.color], strokeWidth: "1.7" }),
        row.parents.map((line, i) => React.createElement("path", { key: i, d: `M${x(row.lane)} 31 C${x(row.lane)} 46 ${x(line.to)} 42 ${x(line.to)} 62`, stroke: COLORS[line.color], strokeWidth: "1.7", fill: "none" })),
        React.createElement("circle", { cx: x(row.lane), cy: "31", r: "4.5", stroke: COLORS[row.color], strokeWidth: "2", fill: "var(--gv-bg)" }));
}
function CheckBox({ checked, partial, label, disabled, onChange }) {
    const ref = useRef(null);
    useEffect(() => { if (ref.current)
        ref.current.indeterminate = !!partial; }, [partial]);
    return React.createElement("input", { ref: ref, className: "gv-checkbox", type: "checkbox", "aria-label": label, checked: checked, disabled: disabled, onChange: onChange });
}
function FileGroup({ mode, items, allCount, selected, onToggle, onToggleAll, onView, onWrite, current, disabled, filtered }) {
    const [open, setOpen] = useState(true);
    const title = mode === 'staged' ? '已暂存' : '未暂存';
    const count = items.filter(file => selected.has(fileKey(mode, file.path))).length;
    return React.createElement("section", { className: "gv-file-group", "aria-label": title },
        React.createElement("div", { className: "gv-section-head" },
            React.createElement(CheckBox, { label: `选择${title}文件`, checked: items.length > 0 && count === items.length, partial: count > 0 && count < items.length, disabled: disabled || !items.length, onChange: () => onToggleAll(items.map(file => fileKey(mode, file.path))) }),
            React.createElement("button", { className: "gv-group-toggle", "aria-expanded": open, onClick: () => setOpen(value => !value) },
                React.createElement(Icon, { name: "chevron", size: 12, className: open ? 'gv-rotate' : '' }),
                title,
                React.createElement("span", { className: "gv-number" }, filtered ? `${items.length}/${allCount}` : allCount)),
            React.createElement("button", { className: "gv-text-btn", disabled: disabled || !items.length, onClick: () => onWrite({ action: mode === 'staged' ? 'unstage' : 'stage', paths: items.map(file => file.path) }) }, mode === 'staged' ? filtered ? '取消匹配项' : '全部取消' : filtered ? '暂存匹配项' : '全部暂存')),
        open && React.createElement("div", { role: "list", className: "gv-file-list" }, items.length ? items.map(file => {
            const name = file.path.split('/').pop(), directory = file.path.includes('/') ? file.path.slice(0, -name.length).replace(/\/$/, '') : '项目根目录';
            const status = conflict(file) ? 'U' : file.index === '?' ? '?' : mode === 'staged' ? file.index : file.worktree;
            const key = fileKey(mode, file.path);
            return React.createElement("div", { role: "listitem", className: `gv-file${current?.path === file.path && current.mode === mode ? ' gv-selected' : ''}${selected.has(key) ? ' gv-checked' : ''}`, key: file.path },
                React.createElement(CheckBox, { label: `选择${title}文件 ${file.path}`, checked: selected.has(key), disabled: disabled, onChange: () => onToggle(key) }),
                React.createElement("button", { className: "gv-file-main gv-list-focus", "aria-label": `查看${title}差异 ${file.path}`, "aria-pressed": current?.path === file.path && current.mode === mode, title: file.oldPath ? file.oldPath + ' → ' + file.path : file.path, onClick: () => onView(file) },
                    React.createElement(Icon, { name: "file", size: 17 }),
                    React.createElement("span", { className: "gv-file-copy" },
                        React.createElement("span", { className: "gv-file-name" }, name),
                        React.createElement("span", { className: "gv-file-dir" }, directory)),
                    React.createElement("span", { className: "gv-status", "data-status": status }, STATUS[status] ?? status)),
                React.createElement("button", { className: "gv-icon-btn gv-file-action", disabled: disabled, "aria-label": (mode === 'staged' ? '取消暂存 ' : '暂存 ') + file.path, title: mode === 'staged' ? '取消暂存' : conflict(file) ? '暂存并标记冲突已解决' : '暂存文件', onClick: () => onWrite({ action: mode === 'staged' ? 'unstage' : 'stage', paths: [file.path] }) },
                    React.createElement(Icon, { name: mode === 'staged' ? 'minus' : 'plus' })));
        }) : React.createElement("div", { className: "gv-empty-small" }, filtered ? '没有匹配的文件' : mode === 'staged' ? '暂存需要提交的文件，它们会出现在这里。' : '没有未暂存的改动')));
}
export function GitPanel({ call, sessionId }) {
    const repo = useWorkspace(call, sessionId);
    const { workspace, data, loading, busy, ref, limit } = repo;
    const [mode, setMode] = useState('working'), [fileQuery, setFileQuery] = useState(''), [commitQuery, setCommitQuery] = useState('');
    const [selection, setSelection] = useState(null), [patch, setPatch] = useState(null), [patchLoading, setPatchLoading] = useState(false);
    const [hash, setHash] = useState(''), [detail, setDetail] = useState(null), [detailLoading, setDetailLoading] = useState(false);
    const [confirm, setConfirm] = useState(null), [detailOpen, setDetailOpen] = useState(false), [picked, setPicked] = useState(new Set());
    const [drafts, setDrafts] = useState({});
    const root = useRef(null), search = useRef(null);
    const id = useId(), message = drafts[workspace] ?? readDraft(workspace);
    const setMessage = (value) => {
        setDrafts(previous => ({ ...previous, [workspace]: value }));
        try {
            if (value)
                window.sessionStorage.setItem('dsh-git-visual:draft:' + workspace, value);
            else
                window.sessionStorage.removeItem('dsh-git-visual:draft:' + workspace);
        }
        catch { }
    };
    const staged = data?.files.filter(isStaged) ?? [], working = data?.files.filter(isWorking) ?? [];
    const disabled = !!busy || loading || repo.outdated || !data;
    const graph = useMemo(() => layoutGraph(data?.commits ?? []), [data?.commits]);
    const query = mode === 'working' ? fileQuery : commitQuery, normalized = query.trim().toLocaleLowerCase();
    const matchesFile = (file) => !normalized || (file.path + ' ' + (file.oldPath ?? '')).toLocaleLowerCase().includes(normalized);
    const shownStaged = staged.filter(matchesFile), shownWorking = working.filter(matchesFile);
    const commits = (data?.commits ?? []).map((commit, index) => ({ commit, index })).filter(({ commit }) => !normalized || [commit.subject, commit.author, commit.hash, commit.refs].join(' ').toLocaleLowerCase().includes(normalized));
    const pickedStaged = staged.filter(file => picked.has(fileKey('staged', file.path))), pickedWorking = working.filter(file => picked.has(fileKey('working', file.path)));
    const viewingBranch = data?.branches.find(branch => branch.ref === ref);
    const visibleKeys = new Set([...shownStaged.map(file => fileKey('staged', file.path)), ...shownWorking.map(file => fileKey('working', file.path))]);
    const hiddenPicked = [...picked].filter(key => !visibleKeys.has(key)).length;
    useEffect(() => {
        if (!data)
            return;
        const valid = new Set([...data.files.filter(isStaged).map(file => fileKey('staged', file.path)), ...data.files.filter(isWorking).map(file => fileKey('working', file.path))]);
        setPicked(previous => new Set([...previous].filter(key => valid.has(key))));
        if (mode === 'working') {
            setSelection(previous => {
                const found = previous?.mode !== 'commit' ? data.files.find(file => file.path === previous?.path) : undefined;
                const file = found ?? data.files.find(isWorking) ?? data.files.find(isStaged);
                if (!file)
                    return null;
                const nextMode = previous?.mode === 'staged' && isStaged(file) ? 'staged' : isWorking(file) ? 'working' : 'staged';
                if (previous?.path === file.path && previous.mode === nextMode)
                    return previous;
                return { path: file.path, mode: nextMode };
            });
            if (!data.files.length)
                setDetailOpen(false);
        }
        else if (!commits.some(({ commit }) => commit.hash === hash))
            setHash(commits[0]?.commit.hash ?? '');
    }, [data, mode, hash, normalized]);
    useEffect(() => {
        if (!selection || !workspace) {
            setPatch(null);
            setPatchLoading(false);
            return;
        }
        const controller = new AbortController();
        setPatchLoading(true);
        call({ action: 'diff', workspaceId: workspace, ...selection }, controller.signal).then(result => { if (!controller.signal.aborted)
            setPatch(result); })
            .catch(error => { if (!controller.signal.aborted) {
            setPatch(null);
            repo.setError(errorText(error));
        } }).finally(() => { if (!controller.signal.aborted)
            setPatchLoading(false); });
        return () => controller.abort();
    }, [call, workspace, selection, data]);
    useEffect(() => {
        if (!hash || !workspace || mode !== 'history') {
            setDetail(null);
            setDetailLoading(false);
            if (mode === 'history')
                setSelection(null);
            return;
        }
        const controller = new AbortController();
        setDetailLoading(true);
        setDetail(null);
        setSelection(null);
        call({ action: 'commitDetail', workspaceId: workspace, hash }, controller.signal).then(result => {
            if (controller.signal.aborted)
                return;
            setDetail(result);
            setSelection(result.files[0] ? { path: result.files[0].path, mode: 'commit', hash } : null);
        }).catch(error => { if (!controller.signal.aborted)
            repo.setError(errorText(error)); }).finally(() => { if (!controller.signal.aborted)
            setDetailLoading(false); });
        return () => controller.abort();
    }, [call, workspace, hash, mode]);
    const reset = () => { setSelection(null); setHash(''); setDetail(null); setPatch(null); setDetailOpen(false); setPicked(new Set()); };
    const changeMode = (next) => { if (next !== mode) {
        setMode(next);
        reset();
    } };
    const toggle = (key) => setPicked(previous => { const next = new Set(previous); if (next.has(key))
        next.delete(key);
    else
        next.add(key); return next; });
    const toggleAll = (keys) => setPicked(previous => { const next = new Set(previous), remove = keys.every(key => next.has(key)); keys.forEach(key => { if (remove)
        next.delete(key);
    else
        next.add(key); }); return next; });
    const write = async (request) => { if (await repo.mutate(request) && request.action === 'commit') {
        setMessage('');
        setPicked(new Set());
    } };
    const chooseFile = (file, mode) => { setPatch(null); setPatchLoading(true); setSelection({ path: file.path, mode }); setDetailOpen(true); };
    const back = () => { setDetailOpen(false); setTimeout(() => root.current?.querySelector('.gv-list-focus[aria-pressed="true"]')?.focus(), 0); };
    const copyHash = async () => {
        try {
            await navigator.clipboard.writeText(hash);
            repo.setNotice('提交哈希已复制');
        }
        catch {
            repo.setError('无法访问剪贴板。提交哈希：' + hash);
        }
    };
    const selectedName = selection?.path.split('/').pop();
    const selectedPath = selection?.path.includes('/') ? selection.path.slice(0, -selectedName.length).replace(/\/$/, '') : '';
    return React.createElement("div", { ref: root, className: `gv-root${detailOpen ? ' gv-detail-open' : ''}`, "aria-label": "Git \u53EF\u89C6\u5316", onKeyDown: event => {
            if (confirm)
                return;
            const editable = event.target instanceof HTMLElement && !!event.target.closest('input,textarea,select,[contenteditable="true"]');
            if (event.key === '/' && !editable && !event.metaKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                search.current?.focus();
            }
            if (event.key === 'Escape' && !editable && detailOpen) {
                event.preventDefault();
                back();
            }
            if (event.altKey && event.key.toLowerCase() === 'r') {
                event.preventDefault();
                if (!busy)
                    void repo.refresh();
            }
            if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) && event.target instanceof HTMLElement && event.target.closest('.gv-list-focus')) {
                const buttons = Array.from(root.current?.querySelectorAll('.gv-list-focus') ?? []);
                const at = buttons.indexOf(event.target.closest('.gv-list-focus'));
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, at + (event.key === 'ArrowDown' ? 1 : -1)));
                event.preventDefault();
                buttons[next]?.focus();
            }
        } },
        React.createElement("header", { className: "gv-header" },
            React.createElement("div", { className: "gv-heading" },
                React.createElement("span", { className: "gv-brand-icon" },
                    React.createElement(GitIcon, { size: 21 })),
                React.createElement("strong", null, "\u6E90\u4EE3\u7801\u7BA1\u7406"),
                React.createElement("span", { className: "gv-version" }, "Git"),
                React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u5237\u65B0 Git", title: "\u5237\u65B0\u4ED3\u5E93 \u00B7 Alt+R", disabled: !!busy || loading || !workspace, onClick: () => void repo.refresh() },
                    React.createElement(Icon, { name: "refresh", className: loading ? 'gv-spin' : '' }))),
            React.createElement("div", { className: "gv-toolbar" },
                React.createElement("label", { className: "gv-project-label", htmlFor: id + '-project' }, "\u9879\u76EE"),
                React.createElement("select", { id: id + '-project', className: "gv-project", "aria-label": "\u9879\u76EE\u5DE5\u4F5C\u533A", value: workspace, disabled: !!busy, onChange: event => { repo.chooseWorkspace(event.target.value); reset(); setFileQuery(''); setCommitQuery(''); } },
                    !repo.workspaces.length && React.createElement("option", { value: "" }, loading ? '正在读取项目…' : '没有可用的项目'),
                    repo.workspaces.map(item => React.createElement("option", { key: item.id, value: item.id }, item.title)))),
            data && React.createElement("div", { className: "gv-summary" },
                React.createElement("span", { className: "gv-branch", title: data.branch },
                    React.createElement(GitIcon, { size: 13 }),
                    React.createElement("span", null, data.branch || 'HEAD')),
                React.createElement("span", { className: data.files.length ? 'gv-dirty' : 'gv-clean' },
                    React.createElement("span", { className: "gv-status-dot" }),
                    data.files.length ? `${data.files.length} 个改动` : '工作区干净'),
                (data.ahead > 0 || data.behind > 0) && React.createElement("span", { className: "gv-tracking", title: "\u76F8\u5BF9\u4E0A\u6E38\u5206\u652F" },
                    "\u2191",
                    data.ahead,
                    " \u2193",
                    data.behind))),
        repo.error && React.createElement("div", { className: "gv-message gv-error", role: "alert" },
            React.createElement(Icon, { name: "alert" }),
            React.createElement("div", null,
                React.createElement("strong", null, "\u9700\u8981\u5904\u7406"),
                React.createElement("p", null, repo.error),
                React.createElement("button", { className: "gv-text-btn", disabled: !!busy || loading, onClick: () => void repo.refresh() }, "\u5237\u65B0\u4ED3\u5E93")),
            React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u5173\u95ED\u9519\u8BEF", onClick: () => repo.setError('') },
                React.createElement(Icon, { name: "close", size: 13 }))),
        repo.notice && React.createElement("div", { className: "gv-message gv-success", role: "status" },
            React.createElement(Icon, { name: "check" }),
            React.createElement("span", null, repo.notice),
            React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u5173\u95ED\u63D0\u793A", onClick: () => repo.setNotice('') },
                React.createElement(Icon, { name: "close", size: 13 }))),
        React.createElement("nav", { className: "gv-tabs", role: "tablist", "aria-label": "Git \u89C6\u56FE" },
            React.createElement("button", { id: id + '-working-tab', role: "tab", "aria-selected": mode === 'working', "aria-controls": id + '-body', className: mode === 'working' ? 'gv-active' : '', onClick: () => changeMode('working') },
                "\u5DE5\u4F5C\u533A",
                React.createElement("span", { className: "gv-number" }, data?.files.length ?? 0)),
            React.createElement("button", { id: id + '-history-tab', role: "tab", "aria-selected": mode === 'history', "aria-controls": id + '-body', className: mode === 'history' ? 'gv-active' : '', onClick: () => changeMode('history') }, "\u63D0\u4EA4\u5386\u53F2")),
        !data ? React.createElement("div", { className: "gv-empty", role: loading ? 'status' : undefined },
            React.createElement(Icon, { name: loading ? 'refresh' : 'git', size: 36, className: loading ? 'gv-spin' : '' }),
            React.createElement("strong", null, loading ? '正在读取仓库…' : repo.error ? '暂时无法读取仓库' : '选择一个 Git 项目'),
            React.createElement("p", null, repo.error ? '检查项目目录后，点击刷新重试。' : repo.workspaces.length ? '从上方选择项目，浏览改动和提交历史。' : '先在 Harness 中添加已有 Git 仓库的项目，再打开此面板。')) : React.createElement("div", { id: id + '-body', className: "gv-body", role: "tabpanel", "aria-labelledby": id + (mode === 'working' ? '-working-tab' : '-history-tab') },
            React.createElement("aside", { className: "gv-sidebar" },
                React.createElement("div", { className: "gv-search" },
                    React.createElement(Icon, { name: "search", size: 15 }),
                    React.createElement("input", { ref: search, "aria-label": mode === 'working' ? '搜索文件' : '搜索提交', value: query, placeholder: mode === 'working' ? '搜索文件或路径…' : '搜索提交、作者或哈希…', onChange: event => mode === 'working' ? setFileQuery(event.target.value) : setCommitQuery(event.target.value), onKeyDown: event => { if (event.key === 'Escape') {
                            event.stopPropagation();
                            mode === 'working' ? setFileQuery('') : setCommitQuery('');
                        } } }),
                    query ? React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u6E05\u9664\u641C\u7D22", onClick: () => mode === 'working' ? setFileQuery('') : setCommitQuery('') },
                        React.createElement(Icon, { name: "close", size: 12 })) : React.createElement("kbd", null, "/")),
                mode === 'working' ? React.createElement(React.Fragment, null,
                    !!picked.size && React.createElement("div", { className: "gv-bulk-bar" },
                        React.createElement("span", null,
                            "\u5DF2\u9009\u62E9 ",
                            picked.size,
                            " \u9879",
                            hiddenPicked > 0 && React.createElement("small", null,
                                " \u00B7 ",
                                hiddenPicked,
                                " \u9879\u5728\u7B5B\u9009\u4E4B\u5916")),
                        pickedWorking.length > 0 && React.createElement("button", { disabled: disabled, onClick: () => void write({ action: 'stage', paths: pickedWorking.map(file => file.path) }) },
                            "\u6682\u5B58 ",
                            pickedWorking.length,
                            " \u9879"),
                        pickedStaged.length > 0 && React.createElement("button", { disabled: disabled, onClick: () => void write({ action: 'unstage', paths: pickedStaged.map(file => file.path) }) },
                            "\u53D6\u6D88\u6682\u5B58 ",
                            pickedStaged.length,
                            " \u9879"),
                        React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u53D6\u6D88\u9009\u62E9", onClick: () => setPicked(new Set()) },
                            React.createElement(Icon, { name: "close", size: 12 }))),
                    React.createElement("div", { className: "gv-file-scroll" },
                        !data.files.length ? React.createElement("div", { className: "gv-clean-state" },
                            React.createElement("span", null,
                                React.createElement(Icon, { name: "check", size: 26 })),
                            React.createElement("strong", null, "\u6240\u6709\u6539\u52A8\u5DF2\u63D0\u4EA4"),
                            React.createElement("p", null, "\u5DE5\u4F5C\u533A\u5E72\u51C0\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u5F00\u53D1\u3002")) : React.createElement(React.Fragment, null,
                            React.createElement(FileGroup, { mode: "staged", items: shownStaged, allCount: staged.length, selected: picked, onToggle: toggle, onToggleAll: toggleAll, onView: file => chooseFile(file, 'staged'), onWrite: request => void write(request), current: selection, disabled: disabled, filtered: !!normalized }),
                            React.createElement(FileGroup, { mode: "working", items: shownWorking, allCount: working.length, selected: picked, onToggle: toggle, onToggleAll: toggleAll, onView: file => chooseFile(file, 'working'), onWrite: request => void write(request), current: selection, disabled: disabled, filtered: !!normalized })),
                        normalized && !shownStaged.length && !shownWorking.length && data.files.length > 0 && React.createElement("div", { className: "gv-filter-empty" },
                            React.createElement("p", null,
                                "\u6CA1\u6709\u627E\u5230\u201C",
                                query,
                                "\u201D"),
                            React.createElement("button", { onClick: () => setFileQuery('') }, "\u6E05\u9664\u641C\u7D22")),
                        data.filesTruncated && React.createElement("div", { className: "gv-diff-note" }, "\u6587\u4EF6\u5217\u8868\u8FC7\u5927\uFF0C\u5F53\u524D\u663E\u793A\u90E8\u5206\u6587\u4EF6\u3002")),
                    React.createElement("div", { className: "gv-commit-form" },
                        React.createElement("label", { htmlFor: id + '-message' },
                            "\u63D0\u4EA4\u8BF4\u660E",
                            message && React.createElement("span", null, "\u8349\u7A3F\u5DF2\u4FDD\u5B58")),
                        React.createElement("textarea", { id: id + '-message', "aria-label": "\u63D0\u4EA4\u8BF4\u660E", placeholder: "\u7B80\u8981\u63CF\u8FF0\u8FD9\u6B21\u4FEE\u6539\u2026", value: message, maxLength: 20_000, disabled: !!busy, onChange: event => setMessage(event.target.value), onKeyDown: event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                                event.preventDefault();
                                if (!disabled && staged.length && message.trim())
                                    void write({ action: 'commit', message });
                            } } }),
                        React.createElement("div", { className: "gv-commit-hint" },
                            !staged.length ? '先暂存需要提交的文件' : `只提交暂存区中的 ${staged.length} 个文件`,
                            React.createElement("kbd", null, "\u2318 / Ctrl \u21B5")),
                        React.createElement("button", { className: "gv-primary gv-submit", disabled: disabled || !staged.length || !message.trim(), onClick: () => void write({ action: 'commit', message }) },
                            React.createElement(Icon, { name: busy === '提交' ? 'refresh' : 'commit', className: busy === '提交' ? 'gv-spin' : '' }),
                            busy === '提交' ? '正在提交…' : staged.length ? `提交 ${staged.length} 个文件` : '提交'))) : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "gv-history-filter" },
                        React.createElement(GitIcon, { size: 14 }),
                        React.createElement("select", { "aria-label": "\u67E5\u770B\u5206\u652F", value: ref, disabled: !!busy, onChange: event => { repo.setRef(event.target.value); repo.setLimit(100); setHash(''); setSelection(null); setDetailOpen(false); } },
                            React.createElement("option", { value: "" }, "\u6240\u6709\u5206\u652F"),
                            React.createElement("optgroup", { label: "\u672C\u5730\u5206\u652F" }, data.branches.filter(branch => !branch.remote).map(branch => React.createElement("option", { key: branch.ref, value: branch.ref },
                                branch.current ? '● ' : '',
                                branch.name))),
                            React.createElement("optgroup", { label: "\u8FDC\u7A0B\u5206\u652F" }, data.branches.filter(branch => branch.remote).map(branch => React.createElement("option", { key: branch.ref, value: branch.ref }, branch.name)))),
                        viewingBranch && !viewingBranch.remote && !viewingBranch.current && React.createElement("button", { disabled: disabled, title: `切换到 ${viewingBranch.name}`, onClick: () => setConfirm(viewingBranch.ref) }, "\u5207\u6362")),
                    React.createElement("div", { className: "gv-history-caption" },
                        normalized ? `匹配 ${commits.length} / ${data.commits.length} 个已加载提交` : `最近 ${data.commits.length} 个提交`,
                        React.createElement("span", null, normalized ? '搜索结果' : '提交图')),
                    React.createElement("div", { className: "gv-history-scroll" },
                        commits.length ? commits.map(({ commit, index }) => React.createElement("button", { className: 'gv-commit-row gv-list-focus' + (hash === commit.hash ? ' gv-selected' : ''), "aria-pressed": hash === commit.hash, key: commit.hash, title: commit.subject, onClick: () => { setHash(commit.hash); setDetailOpen(true); } },
                            normalized ? React.createElement("span", { className: "gv-search-dot" }) : React.createElement(Graph, { row: graph.rows[index], width: Math.max(40, Math.min(180, graph.lanes * 14 + 18)) }),
                            React.createElement("span", { className: "gv-commit-copy" },
                                React.createElement("span", { className: "gv-subject" }, commit.subject || '（无提交说明）'),
                                React.createElement("span", { className: "gv-commit-meta" },
                                    React.createElement("span", { className: "gv-author" }, commit.author),
                                    React.createElement("time", { dateTime: commit.date }, dateLabel(commit.date)),
                                    React.createElement("span", { className: "gv-hash" }, commit.hash.slice(0, 7))),
                                commit.refs && React.createElement("span", { className: "gv-ref", title: commit.refs }, commit.refs.replace(/^HEAD -> /, ''))))) : React.createElement("div", { className: "gv-empty" },
                            React.createElement(Icon, { name: "commit", size: 30 }),
                            React.createElement("strong", null, normalized ? '没有匹配的提交' : '还没有提交'),
                            React.createElement("p", null, normalized ? '试试提交说明、作者或哈希。搜索范围是当前已加载的历史。' : '暂存文件并创建第一个提交后，历史会出现在这里。'),
                            normalized && React.createElement("button", { onClick: () => setCommitQuery('') }, "\u6E05\u9664\u641C\u7D22")),
                        data.moreCommits && limit < 500 && React.createElement("button", { className: "gv-load-more", disabled: loading, onClick: () => repo.setLimit(value => Math.min(500, value + 100)) }, loading ? '正在加载…' : '再加载 100 个提交')))),
            React.createElement("section", { className: "gv-detail", "aria-label": "\u5DEE\u5F02\u8BE6\u60C5" },
                React.createElement("div", { className: "gv-detail-head" },
                    React.createElement("button", { className: "gv-icon-btn gv-back", "aria-label": "\u8FD4\u56DE\u5217\u8868", title: "\u8FD4\u56DE\u5217\u8868 \u00B7 Esc", onClick: back },
                        React.createElement(Icon, { name: "back" })),
                    React.createElement("span", { className: "gv-detail-name" },
                        React.createElement("strong", { title: selection?.path }, selectedName ?? (mode === 'history' ? '提交详情' : '文件差异')),
                        selectedPath && React.createElement("small", { title: selectedPath }, selectedPath)),
                    React.createElement("span", { className: "gv-mode" }, selection?.mode === 'staged' ? '已暂存' : selection?.mode === 'working' ? '工作区' : mode === 'history' ? '提交' : ''),
                    selection && mode === 'working' && React.createElement("button", { className: "gv-detail-action", disabled: disabled, onClick: () => void write({ action: selection.mode === 'staged' ? 'unstage' : 'stage', paths: [selection.path] }) },
                        React.createElement(Icon, { name: selection.mode === 'staged' ? 'minus' : 'plus', size: 14 }),
                        selection.mode === 'staged' ? '取消暂存' : '暂存文件')),
                mode === 'history' && detail && React.createElement("div", { className: "gv-commit-card" },
                    React.createElement("div", { className: "gv-commit-title" },
                        React.createElement(Icon, { name: "commit" }),
                        React.createElement("strong", null, detail.commit.subject)),
                    React.createElement("div", { className: "gv-commit-info" },
                        React.createElement("button", { className: "gv-copy-hash", title: "\u590D\u5236\u5B8C\u6574\u63D0\u4EA4\u54C8\u5E0C", onClick: () => void copyHash() },
                            detail.commit.hash.slice(0, 10),
                            React.createElement(Icon, { name: "copy", size: 12 })),
                        React.createElement("span", null, detail.commit.author),
                        React.createElement("time", { dateTime: detail.commit.date }, dateLabel(detail.commit.date))),
                    detail.message !== detail.commit.subject && React.createElement("pre", null, detail.message),
                    React.createElement("label", { className: "gv-commit-file-label" },
                        "\u4FEE\u6539\u6587\u4EF6",
                        React.createElement("span", { className: "gv-number" }, detail.files.length),
                        React.createElement("select", { "aria-label": "\u63D0\u4EA4\u4E2D\u7684\u6587\u4EF6", value: selection?.path ?? '', onChange: event => setSelection({ path: event.target.value, mode: 'commit', hash }) },
                            !detail.files.length && React.createElement("option", { value: "" }, "\u8FD9\u4E2A\u63D0\u4EA4\u6CA1\u6709\u6587\u4EF6\u5DEE\u5F02"),
                            detail.files.map(file => React.createElement("option", { key: file.path, value: file.path },
                                STATUS[file.status[0]] ?? file.status,
                                " \u00B7 ",
                                file.path))))),
                React.createElement(DiffView, { value: patch, loading: patchLoading || detailLoading, selected: !!selection, onMessage: repo.setNotice }))),
        React.createElement("footer", { className: "gv-footer" },
            React.createElement("span", { title: data?.root }, busy ? React.createElement(React.Fragment, null,
                React.createElement(Icon, { name: "refresh", className: "gv-spin", size: 12 }),
                "\u6B63\u5728",
                busy,
                "\u2026") : repo.outdated ? React.createElement(React.Fragment, null,
                React.createElement(Icon, { name: "alert", size: 12 }),
                "\u72B6\u6001\u9700\u8981\u5237\u65B0") : loading ? '正在刷新…' : repo.updatedAt ? '已更新 ' + new Date(repo.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '本地 Git'),
            React.createElement("span", { className: "gv-footer-root", title: data?.root }, data?.root.split('/').pop()),
            React.createElement("span", null, data?.head?.slice(0, 8) ?? '尚无提交')),
        confirm && React.createElement(BranchDialog, { from: data?.branch ?? '', to: data?.branches.find(branch => branch.ref === confirm)?.name ?? confirm, changes: data?.files.length ?? 0, onCancel: () => setConfirm(null), onConfirm: () => { const next = confirm; setConfirm(null); void write({ action: 'switch', ref: next }); } }));
}
