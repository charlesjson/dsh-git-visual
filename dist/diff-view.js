import React, { useEffect, useMemo, useRef, useState } from 'react';
import { parseDiff, splitDiff } from './diff-model.js';
import { GitIcon, Icon } from './icons.js';
export function DiffView({ value, loading, selected = false, onMessage }) {
    const [view, setView] = useState('unified'), [wrap, setWrap] = useState(true), [headers, setHeaders] = useState(false), [hunk, setHunk] = useState(0);
    const scroller = useRef(null);
    const parsed = useMemo(() => parseDiff(value?.patch ?? ''), [value?.patch]);
    const lines = useMemo(() => parsed.lines.filter(line => headers || line.kind !== 'meta').slice(0, 2000), [parsed, headers]);
    const split = useMemo(() => splitDiff(lines), [lines]);
    const hunks = lines.filter(line => line.kind === 'hunk');
    useEffect(() => { setHunk(0); if (scroller.current)
        scroller.current.scrollTop = 0; }, [value?.patch]);
    const jump = (next) => {
        if (!hunks.length)
            return;
        const index = Math.max(0, Math.min(hunks.length - 1, next));
        setHunk(index);
        const root = scroller.current, row = root?.querySelector(`[data-hunk="${hunks[index].id}"]`);
        if (root && row)
            root.scrollTo({ top: row.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 28, behavior: 'smooth' });
    };
    if (loading)
        return React.createElement("div", { className: "gv-empty", role: "status" },
            React.createElement(Icon, { name: "refresh", className: "gv-spin", size: 25 }),
            React.createElement("strong", null, "\u6B63\u5728\u8BFB\u53D6\u5DEE\u5F02\u2026"));
    if (!value || !value.patch)
        return React.createElement("div", { className: "gv-empty" },
            React.createElement(GitIcon, { size: 34 }),
            React.createElement("strong", null, selected ? '没有可显示的文本差异' : '选择文件查看差异'),
            React.createElement("p", null, selected ? '文件可能没有文本改动，或其状态已经变化。' : '点击文件可查看修改，使用 + 按钮将它加入暂存区。'));
    if (value.binary)
        return React.createElement("div", { className: "gv-empty" },
            React.createElement(Icon, { name: "file", size: 34 }),
            React.createElement("strong", null, "\u4E8C\u8FDB\u5236\u6587\u4EF6"),
            React.createElement("p", null, "\u53EF\u4EE5\u6682\u5B58\u548C\u63D0\u4EA4\u6B64\u6587\u4EF6\uFF0C\u5F53\u524D\u4E0D\u63D0\u4F9B\u6587\u672C\u5DEE\u5F02\u9884\u89C8\u3002"));
    if (!parsed.hunks && !/^(diff |--- |Binary )/m.test(value.patch))
        return React.createElement("div", { className: "gv-empty" },
            React.createElement(Icon, { name: "file", size: 30 }),
            React.createElement("p", null, value.patch));
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value.patch);
            onMessage?.('差异已复制');
        }
        catch {
            onMessage?.('无法访问剪贴板，请在差异中选择并复制文本。');
        }
    };
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "gv-diff-toolbar" },
            React.createElement("div", { className: "gv-diff-stats", "aria-label": `增加 ${parsed.added} 行，删除 ${parsed.deleted} 行` },
                React.createElement("span", { className: "gv-added" },
                    "+",
                    parsed.added),
                React.createElement("span", { className: "gv-deleted" },
                    "\u2212",
                    parsed.deleted)),
            React.createElement("div", { className: "gv-segment", "aria-label": "\u5DEE\u5F02\u663E\u793A\u65B9\u5F0F" },
                React.createElement("button", { "aria-pressed": view === 'unified', onClick: () => setView('unified') }, "\u7EDF\u4E00"),
                React.createElement("button", { "aria-pressed": view === 'split', onClick: () => setView('split') }, "\u5E76\u6392")),
            React.createElement("span", { className: "gv-toolbar-spacer" }),
            React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u81EA\u52A8\u6362\u884C", "aria-pressed": wrap, title: "\u81EA\u52A8\u6362\u884C", onClick: () => setWrap(value => !value) },
                React.createElement(Icon, { name: "wrap" })),
            React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u663E\u793A Git \u5934\u4FE1\u606F", "aria-pressed": headers, title: "\u663E\u793A Git \u5934\u4FE1\u606F", onClick: () => setHeaders(value => !value) },
                React.createElement("span", { className: "gv-code-glyph" }, "\u00B7\u00B7\u00B7")),
            React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u590D\u5236\u5DEE\u5F02", title: "\u590D\u5236\u5DEE\u5F02", onClick: () => void copy() },
                React.createElement(Icon, { name: "copy" })),
            hunks.length > 0 && React.createElement("div", { className: "gv-hunk-nav" },
                React.createElement("span", null,
                    hunk + 1,
                    "/",
                    hunks.length),
                React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u4E0A\u4E00\u5904\u4FEE\u6539", disabled: hunk === 0, onClick: () => jump(hunk - 1) },
                    React.createElement(Icon, { name: "up" })),
                React.createElement("button", { className: "gv-icon-btn", "aria-label": "\u4E0B\u4E00\u5904\u4FEE\u6539", disabled: hunk >= hunks.length - 1, onClick: () => jump(hunk + 1) },
                    React.createElement(Icon, { name: "down" })))),
        React.createElement("div", { ref: scroller, className: `gv-diff${wrap ? ' gv-wrap' : ''}${view === 'split' ? ' gv-diff-split' : ''}`, "aria-label": "\u6587\u4EF6\u5DEE\u5F02", tabIndex: 0 },
            React.createElement("table", { className: "gv-diff-table" },
                React.createElement("colgroup", null,
                    React.createElement("col", { style: { width: 35 } }),
                    view === 'unified' ? React.createElement(React.Fragment, null,
                        React.createElement("col", { style: { width: 35 } }),
                        React.createElement("col", null)) : React.createElement(React.Fragment, null,
                        React.createElement("col", { className: "gv-code-column" }),
                        React.createElement("col", { style: { width: 35 } }),
                        React.createElement("col", { className: "gv-code-column" }))),
                React.createElement("thead", null, view === 'unified' ? React.createElement("tr", null,
                    React.createElement("th", { className: "gv-num" }, "\u65E7"),
                    React.createElement("th", { className: "gv-num" }, "\u65B0"),
                    React.createElement("th", { className: "gv-code-heading" }, "\u4FEE\u6539\u5185\u5BB9")) : React.createElement("tr", null,
                    React.createElement("th", { colSpan: 2 }, "\u4FEE\u6539\u524D"),
                    React.createElement("th", { colSpan: 2 }, "\u4FEE\u6539\u540E"))),
                React.createElement("tbody", null, view === 'unified' ? lines.map(line => React.createElement("tr", { key: line.id, className: `gv-diff-${line.kind}`, "data-hunk": line.kind === 'hunk' ? line.id : undefined },
                    React.createElement("td", { className: "gv-num" }, line.old),
                    React.createElement("td", { className: "gv-num" }, line.next),
                    React.createElement("td", { className: "gv-code" }, line.text)))
                    : split.map(row => row.header ? React.createElement("tr", { key: row.id, className: `gv-diff-${row.header.kind}`, "data-hunk": row.header.kind === 'hunk' ? row.header.id : undefined },
                        React.createElement("td", { colSpan: 4, className: "gv-code" }, row.header.text)) : React.createElement("tr", { key: row.id },
                        React.createElement("td", { className: `gv-num gv-diff-${row.left?.kind ?? 'blank'}` }, row.left?.old),
                        React.createElement("td", { className: `gv-code gv-diff-${row.left?.kind ?? 'blank'}` }, row.left?.text.slice(1)),
                        React.createElement("td", { className: `gv-num gv-diff-${row.right?.kind ?? 'blank'}` }, row.right?.next),
                        React.createElement("td", { className: `gv-code gv-diff-${row.right?.kind ?? 'blank'}` }, row.right?.text.slice(1)))))),
            lines.length === 0 && React.createElement("div", { className: "gv-empty-small" },
                "\u6B64\u4FEE\u6539\u4EC5\u5305\u542B\u6587\u4EF6\u5C5E\u6027\u6216\u8DEF\u5F84\u53D8\u5316\u3002",
                React.createElement("button", { onClick: () => setHeaders(true) }, "\u663E\u793A\u8BE6\u7EC6\u4FE1\u606F")),
            (value.truncated || parsed.lines.filter(line => headers || line.kind !== 'meta').length > 2000) && React.createElement("div", { className: "gv-diff-note" }, "\u5DEE\u5F02\u8F83\u5927\uFF0C\u5DF2\u622A\u53D6\u524D\u9762\u7684\u5185\u5BB9\u3002")));
}
