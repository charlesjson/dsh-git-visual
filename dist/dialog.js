import React, { useEffect, useId, useRef } from 'react';
import { Icon } from './icons.js';
export function BranchDialog({ from, to, changes, onCancel, onConfirm }) {
    const dialog = useRef(null);
    const titleId = useId();
    useEffect(() => {
        const previous = document.activeElement;
        dialog.current?.querySelector('button')?.focus();
        return () => { if (previous instanceof HTMLElement && previous.isConnected)
            previous.focus(); };
    }, []);
    return React.createElement("div", { className: "gv-modal-cover", onMouseDown: event => { if (event.target === event.currentTarget)
            onCancel(); } },
        React.createElement("div", { ref: dialog, className: "gv-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, onKeyDown: event => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    onCancel();
                }
                if (event.key === 'Tab') {
                    const buttons = Array.from(dialog.current?.querySelectorAll('button') ?? []);
                    const first = buttons[0], last = buttons.at(-1);
                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last?.focus();
                    }
                    else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first?.focus();
                    }
                }
            } },
            React.createElement("div", { className: "gv-dialog-heading" },
                React.createElement(Icon, { name: "git", size: 23 }),
                React.createElement("h3", { id: titleId }, "\u5207\u6362\u5206\u652F")),
            React.createElement("div", { className: "gv-branch-transition" },
                React.createElement("span", { title: from }, from || 'HEAD'),
                React.createElement(Icon, { name: "chevron" }),
                React.createElement("strong", { title: to }, to)),
            React.createElement("p", null, changes ? `当前有 ${changes} 个未提交的文件。Git 会在切换将覆盖本地改动时拒绝操作。` : '工作区干净，可以切换到这个本地分支。'),
            React.createElement("div", { className: "gv-dialog-actions" },
                React.createElement("button", { onClick: onCancel }, "\u53D6\u6D88"),
                React.createElement("button", { className: "gv-primary", onClick: onConfirm },
                    React.createElement(Icon, { name: "git" }),
                    "\u5207\u6362\u5206\u652F"))));
}
