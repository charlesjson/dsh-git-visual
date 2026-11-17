window.__ModuleLoader__.load({id:"dsh-git-visual",factory:(require)=>{var module={exports:{}};var exports=module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);

// src/host-api.ts
function assertHostMethods(plugin, host, methods) {
  const missingMethods = methods.filter((path) => {
    let value = host;
    for (const key of path.split(".")) {
      if (value === null || typeof value !== "object" && typeof value !== "function") return true;
      value = Reflect.get(value, key);
    }
    return typeof value !== "function";
  });
  if (missingMethods.length) {
    throw Object.assign(new Error(`[${plugin}] \u5F53\u524D DSH \u7F3A\u5C11\u5FC5\u9700\u63A5\u53E3\uFF1A${missingMethods.join("\u3001")}\u3002\u8BF7\u5347\u7EA7\u63D2\u4EF6\u4EE5\u9002\u914D\u5F53\u524D DSH\u3002`), {
      code: "DSH_API_UNSUPPORTED",
      missingMethods
    });
  }
}
function hostMethodsAvailable(plugin, host, methods) {
  try {
    assertHostMethods(plugin, host, methods);
    return true;
  } catch (error) {
    console.warn(error instanceof Error ? error.message : error);
    return false;
  }
}

// src/client.tsx
var import_react6 = __toESM(require("react"), 1);

// src/panel.tsx
var import_react5 = __toESM(require("react"), 1);

// src/graph.ts
function layoutGraph(commits) {
  let live = [], maximum = 1, nextColor = 0;
  const colors = /* @__PURE__ */ new Map();
  const color = (hash) => {
    if (!colors.has(hash)) colors.set(hash, nextColor++ % 6);
    return colors.get(hash);
  };
  const rows = commits.map((commit) => {
    const before = [...live], incoming = live.includes(commit.hash);
    if (!incoming) live.push(commit.hash);
    const lane = live.indexOf(commit.hash), ownColor = color(commit.hash);
    const next = live.filter((hash) => hash !== commit.hash);
    let insertAt = lane;
    for (const [index, parent] of commit.parents.entries()) {
      if (!colors.has(parent)) colors.set(parent, index === 0 ? ownColor : nextColor++ % 6);
      if (!next.includes(parent)) next.splice(insertAt++, 0, parent);
    }
    const row = {
      lane,
      color: ownColor,
      incoming,
      through: before.filter((hash) => hash !== commit.hash).map((hash) => ({ from: before.indexOf(hash), to: next.indexOf(hash), color: color(hash) })),
      parents: commit.parents.map((parent) => ({ to: next.indexOf(parent), color: color(parent) }))
    };
    maximum = Math.max(maximum, live.length, next.length);
    live = next;
    return row;
  });
  return { rows, lanes: maximum };
}

// src/icons.tsx
var import_react = __toESM(require("react"), 1);
var paths = {
  git: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M6 5v14m0-9c0 4 12 0 12 5v4" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "6", cy: "4", r: "2" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "6", cy: "20", r: "2" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "18", cy: "20", r: "2" })),
  file: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M14 3v6h6" })),
  search: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "m16 16 5 5" })),
  refresh: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M20 7v5h-5M4 17v-5h5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1" })),
  check: /* @__PURE__ */ import_react.default.createElement("path", { d: "m5 12 4 4L19 6" }),
  plus: /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 5v14M5 12h14" }),
  minus: /* @__PURE__ */ import_react.default.createElement("path", { d: "M5 12h14" }),
  back: /* @__PURE__ */ import_react.default.createElement("path", { d: "m13 5-7 7 7 7M6 12h15" }),
  close: /* @__PURE__ */ import_react.default.createElement("path", { d: "m6 6 12 12M6 18 18 6" }),
  chevron: /* @__PURE__ */ import_react.default.createElement("path", { d: "m9 5 7 7-7 7" }),
  copy: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "8", y: "8", width: "12", height: "13", rx: "2" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" })),
  commit: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M2 12h5m10 0h5" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "5" })),
  wrap: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 6h18M3 11h13a4 4 0 0 1 0 8h-5m3-3-3 3 3 3M3 16h3" })),
  up: /* @__PURE__ */ import_react.default.createElement("path", { d: "m6 15 6-6 6 6" }),
  down: /* @__PURE__ */ import_react.default.createElement("path", { d: "m6 9 6 6 6-6" }),
  alert: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "m12 3 10 18H2zM12 9v5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 17h.01" }))
};
function Icon({ name: name2, size = 16, className = "" }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, paths[name2]);
}
function GitIcon({ size = 20 }) {
  return /* @__PURE__ */ import_react.default.createElement(Icon, { name: "git", size });
}

// src/diff-view.tsx
var import_react2 = __toESM(require("react"), 1);

// src/diff-model.ts
function parseDiff(patch) {
  let old = 0, next = 0, inHunk = false, added = 0, deleted = 0, hunks = 0;
  const raw = patch.split("\n");
  if (raw.at(-1) === "") raw.pop();
  const lines = raw.map((text, id) => {
    if (text.startsWith("diff --git ")) inHunk = false;
    const match = text.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (match) {
      old = Number(match[1]);
      next = Number(match[2]);
      inHunk = true;
      hunks++;
      return { id, text, kind: "hunk", old: null, next: null };
    }
    if (inHunk && text.startsWith("+")) {
      added++;
      return { id, text, kind: "add", old: null, next: next++ };
    }
    if (inHunk && text.startsWith("-")) {
      deleted++;
      return { id, text, kind: "del", old: old++, next: null };
    }
    if (inHunk && text.startsWith(" ")) return { id, text, kind: "context", old: old++, next: next++ };
    return { id, text, kind: "meta", old: null, next: null };
  });
  return { lines, added, deleted, hunks };
}
function splitDiff(lines) {
  const rows = [];
  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    if (line.kind === "meta" || line.kind === "hunk") {
      rows.push({ id: line.id, header: line });
      i++;
      continue;
    }
    if (line.kind === "context") {
      rows.push({ id: line.id, left: line, right: line });
      i++;
      continue;
    }
    const deleted = [], added = [];
    while (i < lines.length && lines[i].kind === "del") deleted.push(lines[i++]);
    while (i < lines.length && lines[i].kind === "add") added.push(lines[i++]);
    for (let j = 0; j < Math.max(deleted.length, added.length); j++) rows.push({ id: (deleted[j] ?? added[j]).id, left: deleted[j], right: added[j] });
  }
  return rows;
}

// src/diff-view.tsx
function DiffView({ value, loading, selected = false, onMessage }) {
  const [view, setView] = (0, import_react2.useState)("unified"), [wrap, setWrap] = (0, import_react2.useState)(true), [headers, setHeaders] = (0, import_react2.useState)(false), [hunk, setHunk] = (0, import_react2.useState)(0);
  const scroller = (0, import_react2.useRef)(null);
  const parsed = (0, import_react2.useMemo)(() => parseDiff(value?.patch ?? ""), [value?.patch]);
  const lines = (0, import_react2.useMemo)(() => parsed.lines.filter((line) => headers || line.kind !== "meta").slice(0, 2e3), [parsed, headers]);
  const split = (0, import_react2.useMemo)(() => splitDiff(lines), [lines]);
  const hunks = lines.filter((line) => line.kind === "hunk");
  (0, import_react2.useEffect)(() => {
    setHunk(0);
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [value?.patch]);
  const jump = (next) => {
    if (!hunks.length) return;
    const index = Math.max(0, Math.min(hunks.length - 1, next));
    setHunk(index);
    const root = scroller.current, row = root?.querySelector(`[data-hunk="${hunks[index].id}"]`);
    if (root && row) root.scrollTo({ top: row.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 28, behavior: "smooth" });
  };
  if (loading) return /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-empty", role: "status" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "refresh", className: "gv-spin", size: 25 }), /* @__PURE__ */ import_react2.default.createElement("strong", null, "\u6B63\u5728\u8BFB\u53D6\u5DEE\u5F02\u2026"));
  if (!value || !value.patch) return /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-empty" }, /* @__PURE__ */ import_react2.default.createElement(GitIcon, { size: 34 }), /* @__PURE__ */ import_react2.default.createElement("strong", null, selected ? "\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6587\u672C\u5DEE\u5F02" : "\u9009\u62E9\u6587\u4EF6\u67E5\u770B\u5DEE\u5F02"), /* @__PURE__ */ import_react2.default.createElement("p", null, selected ? "\u6587\u4EF6\u53EF\u80FD\u6CA1\u6709\u6587\u672C\u6539\u52A8\uFF0C\u6216\u5176\u72B6\u6001\u5DF2\u7ECF\u53D8\u5316\u3002" : "\u70B9\u51FB\u6587\u4EF6\u53EF\u67E5\u770B\u4FEE\u6539\uFF0C\u4F7F\u7528 + \u6309\u94AE\u5C06\u5B83\u52A0\u5165\u6682\u5B58\u533A\u3002"));
  if (value.binary) return /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-empty" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "file", size: 34 }), /* @__PURE__ */ import_react2.default.createElement("strong", null, "\u4E8C\u8FDB\u5236\u6587\u4EF6"), /* @__PURE__ */ import_react2.default.createElement("p", null, "\u53EF\u4EE5\u6682\u5B58\u548C\u63D0\u4EA4\u6B64\u6587\u4EF6\uFF0C\u5F53\u524D\u4E0D\u63D0\u4F9B\u6587\u672C\u5DEE\u5F02\u9884\u89C8\u3002"));
  if (!parsed.hunks && !/^(diff |--- |Binary )/m.test(value.patch)) return /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-empty" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "file", size: 30 }), /* @__PURE__ */ import_react2.default.createElement("p", null, value.patch));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value.patch);
      onMessage?.("\u5DEE\u5F02\u5DF2\u590D\u5236");
    } catch {
      onMessage?.("\u65E0\u6CD5\u8BBF\u95EE\u526A\u8D34\u677F\uFF0C\u8BF7\u5728\u5DEE\u5F02\u4E2D\u9009\u62E9\u5E76\u590D\u5236\u6587\u672C\u3002");
    }
  };
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-diff-toolbar" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-diff-stats", "aria-label": `\u589E\u52A0 ${parsed.added} \u884C\uFF0C\u5220\u9664 ${parsed.deleted} \u884C` }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "gv-added" }, "+", parsed.added), /* @__PURE__ */ import_react2.default.createElement("span", { className: "gv-deleted" }, "\u2212", parsed.deleted)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-segment", "aria-label": "\u5DEE\u5F02\u663E\u793A\u65B9\u5F0F" }, /* @__PURE__ */ import_react2.default.createElement("button", { "aria-pressed": view === "unified", onClick: () => setView("unified") }, "\u7EDF\u4E00"), /* @__PURE__ */ import_react2.default.createElement("button", { "aria-pressed": view === "split", onClick: () => setView("split") }, "\u5E76\u6392")), /* @__PURE__ */ import_react2.default.createElement("span", { className: "gv-toolbar-spacer" }), /* @__PURE__ */ import_react2.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u81EA\u52A8\u6362\u884C", "aria-pressed": wrap, title: "\u81EA\u52A8\u6362\u884C", onClick: () => setWrap((value2) => !value2) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "wrap" })), /* @__PURE__ */ import_react2.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u663E\u793A Git \u5934\u4FE1\u606F", "aria-pressed": headers, title: "\u663E\u793A Git \u5934\u4FE1\u606F", onClick: () => setHeaders((value2) => !value2) }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "gv-code-glyph" }, "\xB7\xB7\xB7")), /* @__PURE__ */ import_react2.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u590D\u5236\u5DEE\u5F02", title: "\u590D\u5236\u5DEE\u5F02", onClick: () => void copy() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "copy" })), hunks.length > 0 && /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-hunk-nav" }, /* @__PURE__ */ import_react2.default.createElement("span", null, hunk + 1, "/", hunks.length), /* @__PURE__ */ import_react2.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u4E0A\u4E00\u5904\u4FEE\u6539", disabled: hunk === 0, onClick: () => jump(hunk - 1) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "up" })), /* @__PURE__ */ import_react2.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u4E0B\u4E00\u5904\u4FEE\u6539", disabled: hunk >= hunks.length - 1, onClick: () => jump(hunk + 1) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "down" })))), /* @__PURE__ */ import_react2.default.createElement("div", { ref: scroller, className: `gv-diff${wrap ? " gv-wrap" : ""}${view === "split" ? " gv-diff-split" : ""}`, "aria-label": "\u6587\u4EF6\u5DEE\u5F02", tabIndex: 0 }, /* @__PURE__ */ import_react2.default.createElement("table", { className: "gv-diff-table" }, /* @__PURE__ */ import_react2.default.createElement("colgroup", null, /* @__PURE__ */ import_react2.default.createElement("col", { style: { width: 35 } }), view === "unified" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("col", { style: { width: 35 } }), /* @__PURE__ */ import_react2.default.createElement("col", null)) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("col", { className: "gv-code-column" }), /* @__PURE__ */ import_react2.default.createElement("col", { style: { width: 35 } }), /* @__PURE__ */ import_react2.default.createElement("col", { className: "gv-code-column" }))), /* @__PURE__ */ import_react2.default.createElement("thead", null, view === "unified" ? /* @__PURE__ */ import_react2.default.createElement("tr", null, /* @__PURE__ */ import_react2.default.createElement("th", { className: "gv-num" }, "\u65E7"), /* @__PURE__ */ import_react2.default.createElement("th", { className: "gv-num" }, "\u65B0"), /* @__PURE__ */ import_react2.default.createElement("th", { className: "gv-code-heading" }, "\u4FEE\u6539\u5185\u5BB9")) : /* @__PURE__ */ import_react2.default.createElement("tr", null, /* @__PURE__ */ import_react2.default.createElement("th", { colSpan: 2 }, "\u4FEE\u6539\u524D"), /* @__PURE__ */ import_react2.default.createElement("th", { colSpan: 2 }, "\u4FEE\u6539\u540E"))), /* @__PURE__ */ import_react2.default.createElement("tbody", null, view === "unified" ? lines.map((line) => /* @__PURE__ */ import_react2.default.createElement("tr", { key: line.id, className: `gv-diff-${line.kind}`, "data-hunk": line.kind === "hunk" ? line.id : void 0 }, /* @__PURE__ */ import_react2.default.createElement("td", { className: "gv-num" }, line.old), /* @__PURE__ */ import_react2.default.createElement("td", { className: "gv-num" }, line.next), /* @__PURE__ */ import_react2.default.createElement("td", { className: "gv-code" }, line.text))) : split.map((row) => row.header ? /* @__PURE__ */ import_react2.default.createElement("tr", { key: row.id, className: `gv-diff-${row.header.kind}`, "data-hunk": row.header.kind === "hunk" ? row.header.id : void 0 }, /* @__PURE__ */ import_react2.default.createElement("td", { colSpan: 4, className: "gv-code" }, row.header.text)) : /* @__PURE__ */ import_react2.default.createElement("tr", { key: row.id }, /* @__PURE__ */ import_react2.default.createElement("td", { className: `gv-num gv-diff-${row.left?.kind ?? "blank"}` }, row.left?.old), /* @__PURE__ */ import_react2.default.createElement("td", { className: `gv-code gv-diff-${row.left?.kind ?? "blank"}` }, row.left?.text.slice(1)), /* @__PURE__ */ import_react2.default.createElement("td", { className: `gv-num gv-diff-${row.right?.kind ?? "blank"}` }, row.right?.next), /* @__PURE__ */ import_react2.default.createElement("td", { className: `gv-code gv-diff-${row.right?.kind ?? "blank"}` }, row.right?.text.slice(1)))))), lines.length === 0 && /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-empty-small" }, "\u6B64\u4FEE\u6539\u4EC5\u5305\u542B\u6587\u4EF6\u5C5E\u6027\u6216\u8DEF\u5F84\u53D8\u5316\u3002", /* @__PURE__ */ import_react2.default.createElement("button", { onClick: () => setHeaders(true) }, "\u663E\u793A\u8BE6\u7EC6\u4FE1\u606F")), (value.truncated || parsed.lines.filter((line) => headers || line.kind !== "meta").length > 2e3) && /* @__PURE__ */ import_react2.default.createElement("div", { className: "gv-diff-note" }, "\u5DEE\u5F02\u8F83\u5927\uFF0C\u5DF2\u622A\u53D6\u524D\u9762\u7684\u5185\u5BB9\u3002")));
}

// src/dialog.tsx
var import_react3 = __toESM(require("react"), 1);
function BranchDialog({ from, to, changes, onCancel, onConfirm }) {
  const dialog = (0, import_react3.useRef)(null);
  const titleId = (0, import_react3.useId)();
  (0, import_react3.useEffect)(() => {
    const previous = document.activeElement;
    dialog.current?.querySelector("button")?.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "gv-modal-cover", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onCancel();
  } }, /* @__PURE__ */ import_react3.default.createElement("div", { ref: dialog, className: "gv-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, onKeyDown: (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
    if (event.key === "Tab") {
      const buttons = Array.from(dialog.current?.querySelectorAll("button") ?? []);
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  } }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "gv-dialog-heading" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "git", size: 23 }), /* @__PURE__ */ import_react3.default.createElement("h3", { id: titleId }, "\u5207\u6362\u5206\u652F")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "gv-branch-transition" }, /* @__PURE__ */ import_react3.default.createElement("span", { title: from }, from || "HEAD"), /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "chevron" }), /* @__PURE__ */ import_react3.default.createElement("strong", { title: to }, to)), /* @__PURE__ */ import_react3.default.createElement("p", null, changes ? `\u5F53\u524D\u6709 ${changes} \u4E2A\u672A\u63D0\u4EA4\u7684\u6587\u4EF6\u3002Git \u4F1A\u5728\u5207\u6362\u5C06\u8986\u76D6\u672C\u5730\u6539\u52A8\u65F6\u62D2\u7EDD\u64CD\u4F5C\u3002` : "\u5DE5\u4F5C\u533A\u5E72\u51C0\uFF0C\u53EF\u4EE5\u5207\u6362\u5230\u8FD9\u4E2A\u672C\u5730\u5206\u652F\u3002"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "gv-dialog-actions" }, /* @__PURE__ */ import_react3.default.createElement("button", { onClick: onCancel }, "\u53D6\u6D88"), /* @__PURE__ */ import_react3.default.createElement("button", { className: "gv-primary", onClick: onConfirm }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "git" }), "\u5207\u6362\u5206\u652F"))));
}

// src/use-workspace.ts
var import_react4 = require("react");
var errorText = (error) => error instanceof Error ? error.message : String(error);
var actionNames = { stage: "\u6682\u5B58", unstage: "\u53D6\u6D88\u6682\u5B58", commit: "\u63D0\u4EA4", switch: "\u5207\u6362\u5206\u652F" };
function useWorkspace(call, sessionId) {
  const [workspaces, setWorkspaces] = (0, import_react4.useState)([]);
  const [workspace, setWorkspace] = (0, import_react4.useState)(""), [data, setData] = (0, import_react4.useState)(null);
  const [ref, setRef] = (0, import_react4.useState)(""), [limit, setLimit] = (0, import_react4.useState)(100);
  const [loading, setLoading] = (0, import_react4.useState)(true), [busy, setBusy] = (0, import_react4.useState)("");
  const [error, setError] = (0, import_react4.useState)(""), [notice, setNotice] = (0, import_react4.useState)(""), [outdated, setOutdated] = (0, import_react4.useState)(false);
  const [updatedAt, setUpdatedAt] = (0, import_react4.useState)(null);
  const alive = (0, import_react4.useRef)(true), generation = (0, import_react4.useRef)(0), writing = (0, import_react4.useRef)(false);
  (0, import_react4.useEffect)(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
    };
  }, []);
  const reloadWorkspaces = (0, import_react4.useCallback)(async (signal) => {
    setLoading(true);
    try {
      const result = await call({ action: "workspaces", sessionId }, signal);
      if (signal?.aborted || !alive.current) return;
      setWorkspaces(result.workspaces);
      setWorkspace(result.selected ?? result.workspaces[0]?.id ?? "");
      setError("");
      if (!result.workspaces.length) setLoading(false);
    } catch (error2) {
      if (!signal?.aborted && alive.current) {
        setError(errorText(error2));
        setLoading(false);
      }
    }
  }, [call, sessionId]);
  (0, import_react4.useEffect)(() => {
    const controller = new AbortController();
    void reloadWorkspaces(controller.signal);
    return () => controller.abort();
  }, [reloadWorkspaces]);
  const refresh = (0, import_react4.useCallback)(async (signal) => {
    if (!workspace) return null;
    const token = ++generation.current;
    setLoading(true);
    try {
      const result = await call({ action: "snapshot", workspaceId: workspace, ref: ref || void 0, limit }, signal);
      if (!alive.current || signal?.aborted || generation.current !== token) return null;
      setData(result);
      setError("");
      setOutdated(false);
      setUpdatedAt(Date.now());
      return result;
    } catch (error2) {
      if (alive.current && !signal?.aborted && generation.current === token) {
        setError(errorText(error2));
        setOutdated(true);
      }
      return null;
    } finally {
      if (alive.current && !signal?.aborted && generation.current === token) setLoading(false);
    }
  }, [call, workspace, ref, limit]);
  (0, import_react4.useEffect)(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);
  (0, import_react4.useEffect)(() => {
    const onFocus = () => {
      if (!writing.current) void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);
  (0, import_react4.useEffect)(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5e3);
    return () => clearTimeout(timer);
  }, [notice]);
  const chooseWorkspace = (id) => {
    generation.current++;
    setWorkspace(id);
    setData(null);
    setRef("");
    setLimit(100);
    setError("");
    setNotice("");
    setOutdated(false);
    setUpdatedAt(null);
  };
  const mutate = async (request) => {
    if (!data || writing.current || loading || outdated) return false;
    writing.current = true;
    const label = actionNames[request.action] ?? "\u64CD\u4F5C";
    setBusy(label);
    setError("");
    setNotice("");
    let succeeded = false;
    try {
      await call({ ...request, workspaceId: workspace, expectedHead: data.head });
      succeeded = true;
      if (!alive.current) return true;
      const result = await refresh();
      if (!alive.current) return true;
      const count = request.paths?.length ?? 0;
      const message = request.action === "stage" ? `\u5DF2\u6682\u5B58 ${count} \u4E2A\u6587\u4EF6` : request.action === "unstage" ? `\u5DF2\u53D6\u6D88\u6682\u5B58 ${count} \u4E2A\u6587\u4EF6` : request.action === "commit" ? "\u63D0\u4EA4\u5B8C\u6210" : "\u5DF2\u5207\u6362\u5206\u652F";
      setNotice(message);
      if (!result) setError(`${label}\u5DF2\u5B8C\u6210\uFF0C\u4F46\u72B6\u6001\u5237\u65B0\u5931\u8D25\u3002\u8BF7\u5237\u65B0\u4ED3\u5E93\u540E\u7EE7\u7EED\u64CD\u4F5C\u3002`);
      return true;
    } catch (error2) {
      if (alive.current) setError(`${label}\u5931\u8D25\uFF1A${errorText(error2)}`);
      return succeeded;
    } finally {
      writing.current = false;
      if (alive.current) setBusy("");
    }
  };
  return { workspaces, workspace, data, ref, setRef, limit, setLimit, loading, busy, error, setError, notice, setNotice, outdated, updatedAt, chooseWorkspace, refresh: () => workspace ? refresh() : reloadWorkspaces(), mutate };
}

// src/panel.tsx
var COLORS = ["#6588ed", "#d19a48", "#58ae93", "#bd7bd0", "#e17c83", "#5aaac1"];
var STATUS = { M: "\u4FEE\u6539", A: "\u65B0\u589E", D: "\u5220\u9664", R: "\u6539\u540D", C: "\u590D\u5236", "?": "\u672A\u8DDF\u8E2A", U: "\u51B2\u7A81", T: "\u7C7B\u578B\u53D8\u5316" };
var conflict = (file) => ["DD", "AU", "UD", "UA", "DU", "AA", "UU"].includes(file.index + file.worktree);
var isStaged = (file) => !conflict(file) && ![" ", "?", "!"].includes(file.index);
var isWorking = (file) => conflict(file) || file.worktree !== " " || file.index === "?";
var fileKey = (mode, path) => mode + ":" + path;
function dateLabel(date) {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}
function readDraft(workspace) {
  try {
    return workspace ? window.sessionStorage.getItem("dsh-git-visual:draft:" + workspace) ?? "" : "";
  } catch {
    return "";
  }
}
function Graph({ row, width }) {
  const x = (lane) => 14 + lane * 14;
  return /* @__PURE__ */ import_react5.default.createElement("svg", { width, height: 62, className: "gv-graph", "aria-hidden": "true" }, row.through.map((line, i) => /* @__PURE__ */ import_react5.default.createElement("path", { key: i, d: `M${x(line.from)} 0 C${x(line.from)} 31 ${x(line.to)} 31 ${x(line.to)} 62`, stroke: COLORS[line.color], strokeWidth: "1.7", fill: "none" })), row.incoming && /* @__PURE__ */ import_react5.default.createElement("path", { d: `M${x(row.lane)} 0V31`, stroke: COLORS[row.color], strokeWidth: "1.7" }), row.parents.map((line, i) => /* @__PURE__ */ import_react5.default.createElement("path", { key: i, d: `M${x(row.lane)} 31 C${x(row.lane)} 46 ${x(line.to)} 42 ${x(line.to)} 62`, stroke: COLORS[line.color], strokeWidth: "1.7", fill: "none" })), /* @__PURE__ */ import_react5.default.createElement("circle", { cx: x(row.lane), cy: "31", r: "4.5", stroke: COLORS[row.color], strokeWidth: "2", fill: "var(--gv-bg)" }));
}
function CheckBox({ checked, partial, label, disabled, onChange }) {
  const ref = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    if (ref.current) ref.current.indeterminate = !!partial;
  }, [partial]);
  return /* @__PURE__ */ import_react5.default.createElement("input", { ref, className: "gv-checkbox", type: "checkbox", "aria-label": label, checked, disabled, onChange });
}
function FileGroup({ mode, items, allCount, selected, onToggle, onToggleAll, onView, onWrite, current, disabled, filtered }) {
  const [open, setOpen] = (0, import_react5.useState)(true);
  const title = mode === "staged" ? "\u5DF2\u6682\u5B58" : "\u672A\u6682\u5B58";
  const count = items.filter((file) => selected.has(fileKey(mode, file.path))).length;
  return /* @__PURE__ */ import_react5.default.createElement("section", { className: "gv-file-group", "aria-label": title }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-section-head" }, /* @__PURE__ */ import_react5.default.createElement(CheckBox, { label: `\u9009\u62E9${title}\u6587\u4EF6`, checked: items.length > 0 && count === items.length, partial: count > 0 && count < items.length, disabled: disabled || !items.length, onChange: () => onToggleAll(items.map((file) => fileKey(mode, file.path))) }), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-group-toggle", "aria-expanded": open, onClick: () => setOpen((value) => !value) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "chevron", size: 12, className: open ? "gv-rotate" : "" }), title, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-number" }, filtered ? `${items.length}/${allCount}` : allCount)), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-text-btn", disabled: disabled || !items.length, onClick: () => onWrite({ action: mode === "staged" ? "unstage" : "stage", paths: items.map((file) => file.path) }) }, mode === "staged" ? filtered ? "\u53D6\u6D88\u5339\u914D\u9879" : "\u5168\u90E8\u53D6\u6D88" : filtered ? "\u6682\u5B58\u5339\u914D\u9879" : "\u5168\u90E8\u6682\u5B58")), open && /* @__PURE__ */ import_react5.default.createElement("div", { role: "list", className: "gv-file-list" }, items.length ? items.map((file) => {
    const name2 = file.path.split("/").pop(), directory = file.path.includes("/") ? file.path.slice(0, -name2.length).replace(/\/$/, "") : "\u9879\u76EE\u6839\u76EE\u5F55";
    const status = conflict(file) ? "U" : file.index === "?" ? "?" : mode === "staged" ? file.index : file.worktree;
    const key = fileKey(mode, file.path);
    return /* @__PURE__ */ import_react5.default.createElement("div", { role: "listitem", className: `gv-file${current?.path === file.path && current.mode === mode ? " gv-selected" : ""}${selected.has(key) ? " gv-checked" : ""}`, key: file.path }, /* @__PURE__ */ import_react5.default.createElement(CheckBox, { label: `\u9009\u62E9${title}\u6587\u4EF6 ${file.path}`, checked: selected.has(key), disabled, onChange: () => onToggle(key) }), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-file-main gv-list-focus", "aria-label": `\u67E5\u770B${title}\u5DEE\u5F02 ${file.path}`, "aria-pressed": current?.path === file.path && current.mode === mode, title: file.oldPath ? file.oldPath + " \u2192 " + file.path : file.path, onClick: () => onView(file) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "file", size: 17 }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-file-copy" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-file-name" }, name2), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-file-dir" }, directory)), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-status", "data-status": status }, STATUS[status] ?? status)), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn gv-file-action", disabled, "aria-label": (mode === "staged" ? "\u53D6\u6D88\u6682\u5B58 " : "\u6682\u5B58 ") + file.path, title: mode === "staged" ? "\u53D6\u6D88\u6682\u5B58" : conflict(file) ? "\u6682\u5B58\u5E76\u6807\u8BB0\u51B2\u7A81\u5DF2\u89E3\u51B3" : "\u6682\u5B58\u6587\u4EF6", onClick: () => onWrite({ action: mode === "staged" ? "unstage" : "stage", paths: [file.path] }) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: mode === "staged" ? "minus" : "plus" })));
  }) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-empty-small" }, filtered ? "\u6CA1\u6709\u5339\u914D\u7684\u6587\u4EF6" : mode === "staged" ? "\u6682\u5B58\u9700\u8981\u63D0\u4EA4\u7684\u6587\u4EF6\uFF0C\u5B83\u4EEC\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002" : "\u6CA1\u6709\u672A\u6682\u5B58\u7684\u6539\u52A8")));
}
function GitPanel({ call, sessionId }) {
  const repo = useWorkspace(call, sessionId);
  const { workspace, data, loading, busy, ref, limit } = repo;
  const [mode, setMode] = (0, import_react5.useState)("working"), [fileQuery, setFileQuery] = (0, import_react5.useState)(""), [commitQuery, setCommitQuery] = (0, import_react5.useState)("");
  const [selection, setSelection] = (0, import_react5.useState)(null), [patch, setPatch] = (0, import_react5.useState)(null), [patchLoading, setPatchLoading] = (0, import_react5.useState)(false);
  const [hash, setHash] = (0, import_react5.useState)(""), [detail, setDetail] = (0, import_react5.useState)(null), [detailLoading, setDetailLoading] = (0, import_react5.useState)(false);
  const [confirm, setConfirm] = (0, import_react5.useState)(null), [detailOpen, setDetailOpen] = (0, import_react5.useState)(false), [picked, setPicked] = (0, import_react5.useState)(/* @__PURE__ */ new Set());
  const [drafts, setDrafts] = (0, import_react5.useState)({});
  const root = (0, import_react5.useRef)(null), search = (0, import_react5.useRef)(null);
  const id = (0, import_react5.useId)(), message = drafts[workspace] ?? readDraft(workspace);
  const setMessage = (value) => {
    setDrafts((previous) => ({ ...previous, [workspace]: value }));
    try {
      if (value) window.sessionStorage.setItem("dsh-git-visual:draft:" + workspace, value);
      else window.sessionStorage.removeItem("dsh-git-visual:draft:" + workspace);
    } catch {
    }
  };
  const staged = data?.files.filter(isStaged) ?? [], working = data?.files.filter(isWorking) ?? [];
  const disabled = !!busy || loading || repo.outdated || !data;
  const graph = (0, import_react5.useMemo)(() => layoutGraph(data?.commits ?? []), [data?.commits]);
  const query = mode === "working" ? fileQuery : commitQuery, normalized = query.trim().toLocaleLowerCase();
  const matchesFile = (file) => !normalized || (file.path + " " + (file.oldPath ?? "")).toLocaleLowerCase().includes(normalized);
  const shownStaged = staged.filter(matchesFile), shownWorking = working.filter(matchesFile);
  const commits = (data?.commits ?? []).map((commit, index) => ({ commit, index })).filter(({ commit }) => !normalized || [commit.subject, commit.author, commit.hash, commit.refs].join(" ").toLocaleLowerCase().includes(normalized));
  const pickedStaged = staged.filter((file) => picked.has(fileKey("staged", file.path))), pickedWorking = working.filter((file) => picked.has(fileKey("working", file.path)));
  const viewingBranch = data?.branches.find((branch) => branch.ref === ref);
  const visibleKeys = /* @__PURE__ */ new Set([...shownStaged.map((file) => fileKey("staged", file.path)), ...shownWorking.map((file) => fileKey("working", file.path))]);
  const hiddenPicked = [...picked].filter((key) => !visibleKeys.has(key)).length;
  (0, import_react5.useEffect)(() => {
    if (!data) return;
    const valid = /* @__PURE__ */ new Set([...data.files.filter(isStaged).map((file) => fileKey("staged", file.path)), ...data.files.filter(isWorking).map((file) => fileKey("working", file.path))]);
    setPicked((previous) => new Set([...previous].filter((key) => valid.has(key))));
    if (mode === "working") {
      setSelection((previous) => {
        const found = previous?.mode !== "commit" ? data.files.find((file2) => file2.path === previous?.path) : void 0;
        const file = found ?? data.files.find(isWorking) ?? data.files.find(isStaged);
        if (!file) return null;
        const nextMode = previous?.mode === "staged" && isStaged(file) ? "staged" : isWorking(file) ? "working" : "staged";
        if (previous?.path === file.path && previous.mode === nextMode) return previous;
        return { path: file.path, mode: nextMode };
      });
      if (!data.files.length) setDetailOpen(false);
    } else if (!commits.some(({ commit }) => commit.hash === hash)) setHash(commits[0]?.commit.hash ?? "");
  }, [data, mode, hash, normalized]);
  (0, import_react5.useEffect)(() => {
    if (!selection || !workspace) {
      setPatch(null);
      setPatchLoading(false);
      return;
    }
    const controller = new AbortController();
    setPatchLoading(true);
    call({ action: "diff", workspaceId: workspace, ...selection }, controller.signal).then((result) => {
      if (!controller.signal.aborted) setPatch(result);
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setPatch(null);
        repo.setError(errorText(error));
      }
    }).finally(() => {
      if (!controller.signal.aborted) setPatchLoading(false);
    });
    return () => controller.abort();
  }, [call, workspace, selection, data]);
  (0, import_react5.useEffect)(() => {
    if (!hash || !workspace || mode !== "history") {
      setDetail(null);
      setDetailLoading(false);
      if (mode === "history") setSelection(null);
      return;
    }
    const controller = new AbortController();
    setDetailLoading(true);
    setDetail(null);
    setSelection(null);
    call({ action: "commitDetail", workspaceId: workspace, hash }, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setDetail(result);
      setSelection(result.files[0] ? { path: result.files[0].path, mode: "commit", hash } : null);
    }).catch((error) => {
      if (!controller.signal.aborted) repo.setError(errorText(error));
    }).finally(() => {
      if (!controller.signal.aborted) setDetailLoading(false);
    });
    return () => controller.abort();
  }, [call, workspace, hash, mode]);
  const reset = () => {
    setSelection(null);
    setHash("");
    setDetail(null);
    setPatch(null);
    setDetailOpen(false);
    setPicked(/* @__PURE__ */ new Set());
  };
  const changeMode = (next) => {
    if (next !== mode) {
      setMode(next);
      reset();
    }
  };
  const toggle = (key) => setPicked((previous) => {
    const next = new Set(previous);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
  const toggleAll = (keys) => setPicked((previous) => {
    const next = new Set(previous), remove = keys.every((key) => next.has(key));
    keys.forEach((key) => {
      if (remove) next.delete(key);
      else next.add(key);
    });
    return next;
  });
  const write = async (request) => {
    if (await repo.mutate(request) && request.action === "commit") {
      setMessage("");
      setPicked(/* @__PURE__ */ new Set());
    }
  };
  const chooseFile = (file, mode2) => {
    setPatch(null);
    setPatchLoading(true);
    setSelection({ path: file.path, mode: mode2 });
    setDetailOpen(true);
  };
  const back = () => {
    setDetailOpen(false);
    setTimeout(() => root.current?.querySelector('.gv-list-focus[aria-pressed="true"]')?.focus(), 0);
  };
  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      repo.setNotice("\u63D0\u4EA4\u54C8\u5E0C\u5DF2\u590D\u5236");
    } catch {
      repo.setError("\u65E0\u6CD5\u8BBF\u95EE\u526A\u8D34\u677F\u3002\u63D0\u4EA4\u54C8\u5E0C\uFF1A" + hash);
    }
  };
  const selectedName = selection?.path.split("/").pop();
  const selectedPath = selection?.path.includes("/") ? selection.path.slice(0, -selectedName.length).replace(/\/$/, "") : "";
  return /* @__PURE__ */ import_react5.default.createElement("div", { ref: root, className: `gv-root${detailOpen ? " gv-detail-open" : ""}`, "aria-label": "Git \u53EF\u89C6\u5316", onKeyDown: (event) => {
    if (confirm) return;
    const editable = event.target instanceof HTMLElement && !!event.target.closest('input,textarea,select,[contenteditable="true"]');
    if (event.key === "/" && !editable && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      search.current?.focus();
    }
    if (event.key === "Escape" && !editable && detailOpen) {
      event.preventDefault();
      back();
    }
    if (event.altKey && event.key.toLowerCase() === "r") {
      event.preventDefault();
      if (!busy) void repo.refresh();
    }
    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) && event.target instanceof HTMLElement && event.target.closest(".gv-list-focus")) {
      const buttons = Array.from(root.current?.querySelectorAll(".gv-list-focus") ?? []);
      const at = buttons.indexOf(event.target.closest(".gv-list-focus"));
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, at + (event.key === "ArrowDown" ? 1 : -1)));
      event.preventDefault();
      buttons[next]?.focus();
    }
  } }, /* @__PURE__ */ import_react5.default.createElement("header", { className: "gv-header" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-heading" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-brand-icon" }, /* @__PURE__ */ import_react5.default.createElement(GitIcon, { size: 21 })), /* @__PURE__ */ import_react5.default.createElement("strong", null, "\u6E90\u4EE3\u7801\u7BA1\u7406"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-version" }, "Git"), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u5237\u65B0 Git", title: "\u5237\u65B0\u4ED3\u5E93 \xB7 Alt+R", disabled: !!busy || loading || !workspace, onClick: () => void repo.refresh() }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "refresh", className: loading ? "gv-spin" : "" }))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-toolbar" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "gv-project-label", htmlFor: id + "-project" }, "\u9879\u76EE"), /* @__PURE__ */ import_react5.default.createElement("select", { id: id + "-project", className: "gv-project", "aria-label": "\u9879\u76EE\u5DE5\u4F5C\u533A", value: workspace, disabled: !!busy, onChange: (event) => {
    repo.chooseWorkspace(event.target.value);
    reset();
    setFileQuery("");
    setCommitQuery("");
  } }, !repo.workspaces.length && /* @__PURE__ */ import_react5.default.createElement("option", { value: "" }, loading ? "\u6B63\u5728\u8BFB\u53D6\u9879\u76EE\u2026" : "\u6CA1\u6709\u53EF\u7528\u7684\u9879\u76EE"), repo.workspaces.map((item) => /* @__PURE__ */ import_react5.default.createElement("option", { key: item.id, value: item.id }, item.title)))), data && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-summary" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-branch", title: data.branch }, /* @__PURE__ */ import_react5.default.createElement(GitIcon, { size: 13 }), /* @__PURE__ */ import_react5.default.createElement("span", null, data.branch || "HEAD")), /* @__PURE__ */ import_react5.default.createElement("span", { className: data.files.length ? "gv-dirty" : "gv-clean" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-status-dot" }), data.files.length ? `${data.files.length} \u4E2A\u6539\u52A8` : "\u5DE5\u4F5C\u533A\u5E72\u51C0"), (data.ahead > 0 || data.behind > 0) && /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-tracking", title: "\u76F8\u5BF9\u4E0A\u6E38\u5206\u652F" }, "\u2191", data.ahead, " \u2193", data.behind))), repo.error && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-message gv-error", role: "alert" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "alert" }), /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("strong", null, "\u9700\u8981\u5904\u7406"), /* @__PURE__ */ import_react5.default.createElement("p", null, repo.error), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-text-btn", disabled: !!busy || loading, onClick: () => void repo.refresh() }, "\u5237\u65B0\u4ED3\u5E93")), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u5173\u95ED\u9519\u8BEF", onClick: () => repo.setError("") }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "close", size: 13 }))), repo.notice && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-message gv-success", role: "status" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "check" }), /* @__PURE__ */ import_react5.default.createElement("span", null, repo.notice), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u5173\u95ED\u63D0\u793A", onClick: () => repo.setNotice("") }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "close", size: 13 }))), /* @__PURE__ */ import_react5.default.createElement("nav", { className: "gv-tabs", role: "tablist", "aria-label": "Git \u89C6\u56FE" }, /* @__PURE__ */ import_react5.default.createElement("button", { id: id + "-working-tab", role: "tab", "aria-selected": mode === "working", "aria-controls": id + "-body", className: mode === "working" ? "gv-active" : "", onClick: () => changeMode("working") }, "\u5DE5\u4F5C\u533A", /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-number" }, data?.files.length ?? 0)), /* @__PURE__ */ import_react5.default.createElement("button", { id: id + "-history-tab", role: "tab", "aria-selected": mode === "history", "aria-controls": id + "-body", className: mode === "history" ? "gv-active" : "", onClick: () => changeMode("history") }, "\u63D0\u4EA4\u5386\u53F2")), !data ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-empty", role: loading ? "status" : void 0 }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: loading ? "refresh" : "git", size: 36, className: loading ? "gv-spin" : "" }), /* @__PURE__ */ import_react5.default.createElement("strong", null, loading ? "\u6B63\u5728\u8BFB\u53D6\u4ED3\u5E93\u2026" : repo.error ? "\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\u4ED3\u5E93" : "\u9009\u62E9\u4E00\u4E2A Git \u9879\u76EE"), /* @__PURE__ */ import_react5.default.createElement("p", null, repo.error ? "\u68C0\u67E5\u9879\u76EE\u76EE\u5F55\u540E\uFF0C\u70B9\u51FB\u5237\u65B0\u91CD\u8BD5\u3002" : repo.workspaces.length ? "\u4ECE\u4E0A\u65B9\u9009\u62E9\u9879\u76EE\uFF0C\u6D4F\u89C8\u6539\u52A8\u548C\u63D0\u4EA4\u5386\u53F2\u3002" : "\u5148\u5728 Harness \u4E2D\u6DFB\u52A0\u5DF2\u6709 Git \u4ED3\u5E93\u7684\u9879\u76EE\uFF0C\u518D\u6253\u5F00\u6B64\u9762\u677F\u3002")) : /* @__PURE__ */ import_react5.default.createElement("div", { id: id + "-body", className: "gv-body", role: "tabpanel", "aria-labelledby": id + (mode === "working" ? "-working-tab" : "-history-tab") }, /* @__PURE__ */ import_react5.default.createElement("aside", { className: "gv-sidebar" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-search" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "search", size: 15 }), /* @__PURE__ */ import_react5.default.createElement("input", { ref: search, "aria-label": mode === "working" ? "\u641C\u7D22\u6587\u4EF6" : "\u641C\u7D22\u63D0\u4EA4", value: query, placeholder: mode === "working" ? "\u641C\u7D22\u6587\u4EF6\u6216\u8DEF\u5F84\u2026" : "\u641C\u7D22\u63D0\u4EA4\u3001\u4F5C\u8005\u6216\u54C8\u5E0C\u2026", onChange: (event) => mode === "working" ? setFileQuery(event.target.value) : setCommitQuery(event.target.value), onKeyDown: (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      mode === "working" ? setFileQuery("") : setCommitQuery("");
    }
  } }), query ? /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u6E05\u9664\u641C\u7D22", onClick: () => mode === "working" ? setFileQuery("") : setCommitQuery("") }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "close", size: 12 })) : /* @__PURE__ */ import_react5.default.createElement("kbd", null, "/")), mode === "working" ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, !!picked.size && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-bulk-bar" }, /* @__PURE__ */ import_react5.default.createElement("span", null, "\u5DF2\u9009\u62E9 ", picked.size, " \u9879", hiddenPicked > 0 && /* @__PURE__ */ import_react5.default.createElement("small", null, " \xB7 ", hiddenPicked, " \u9879\u5728\u7B5B\u9009\u4E4B\u5916")), pickedWorking.length > 0 && /* @__PURE__ */ import_react5.default.createElement("button", { disabled, onClick: () => void write({ action: "stage", paths: pickedWorking.map((file) => file.path) }) }, "\u6682\u5B58 ", pickedWorking.length, " \u9879"), pickedStaged.length > 0 && /* @__PURE__ */ import_react5.default.createElement("button", { disabled, onClick: () => void write({ action: "unstage", paths: pickedStaged.map((file) => file.path) }) }, "\u53D6\u6D88\u6682\u5B58 ", pickedStaged.length, " \u9879"), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn", "aria-label": "\u53D6\u6D88\u9009\u62E9", onClick: () => setPicked(/* @__PURE__ */ new Set()) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "close", size: 12 }))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-file-scroll" }, !data.files.length ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-clean-state" }, /* @__PURE__ */ import_react5.default.createElement("span", null, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "check", size: 26 })), /* @__PURE__ */ import_react5.default.createElement("strong", null, "\u6240\u6709\u6539\u52A8\u5DF2\u63D0\u4EA4"), /* @__PURE__ */ import_react5.default.createElement("p", null, "\u5DE5\u4F5C\u533A\u5E72\u51C0\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u5F00\u53D1\u3002")) : /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(FileGroup, { mode: "staged", items: shownStaged, allCount: staged.length, selected: picked, onToggle: toggle, onToggleAll: toggleAll, onView: (file) => chooseFile(file, "staged"), onWrite: (request) => void write(request), current: selection, disabled, filtered: !!normalized }), /* @__PURE__ */ import_react5.default.createElement(FileGroup, { mode: "working", items: shownWorking, allCount: working.length, selected: picked, onToggle: toggle, onToggleAll: toggleAll, onView: (file) => chooseFile(file, "working"), onWrite: (request) => void write(request), current: selection, disabled, filtered: !!normalized })), normalized && !shownStaged.length && !shownWorking.length && data.files.length > 0 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-filter-empty" }, /* @__PURE__ */ import_react5.default.createElement("p", null, "\u6CA1\u6709\u627E\u5230\u201C", query, "\u201D"), /* @__PURE__ */ import_react5.default.createElement("button", { onClick: () => setFileQuery("") }, "\u6E05\u9664\u641C\u7D22")), data.filesTruncated && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-diff-note" }, "\u6587\u4EF6\u5217\u8868\u8FC7\u5927\uFF0C\u5F53\u524D\u663E\u793A\u90E8\u5206\u6587\u4EF6\u3002")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-commit-form" }, /* @__PURE__ */ import_react5.default.createElement("label", { htmlFor: id + "-message" }, "\u63D0\u4EA4\u8BF4\u660E", message && /* @__PURE__ */ import_react5.default.createElement("span", null, "\u8349\u7A3F\u5DF2\u4FDD\u5B58")), /* @__PURE__ */ import_react5.default.createElement("textarea", { id: id + "-message", "aria-label": "\u63D0\u4EA4\u8BF4\u660E", placeholder: "\u7B80\u8981\u63CF\u8FF0\u8FD9\u6B21\u4FEE\u6539\u2026", value: message, maxLength: 2e4, disabled: !!busy, onChange: (event) => setMessage(event.target.value), onKeyDown: (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!disabled && staged.length && message.trim()) void write({ action: "commit", message });
    }
  } }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-commit-hint" }, !staged.length ? "\u5148\u6682\u5B58\u9700\u8981\u63D0\u4EA4\u7684\u6587\u4EF6" : `\u53EA\u63D0\u4EA4\u6682\u5B58\u533A\u4E2D\u7684 ${staged.length} \u4E2A\u6587\u4EF6`, /* @__PURE__ */ import_react5.default.createElement("kbd", null, "\u2318 / Ctrl \u21B5")), /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-primary gv-submit", disabled: disabled || !staged.length || !message.trim(), onClick: () => void write({ action: "commit", message }) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: busy === "\u63D0\u4EA4" ? "refresh" : "commit", className: busy === "\u63D0\u4EA4" ? "gv-spin" : "" }), busy === "\u63D0\u4EA4" ? "\u6B63\u5728\u63D0\u4EA4\u2026" : staged.length ? `\u63D0\u4EA4 ${staged.length} \u4E2A\u6587\u4EF6` : "\u63D0\u4EA4"))) : /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-history-filter" }, /* @__PURE__ */ import_react5.default.createElement(GitIcon, { size: 14 }), /* @__PURE__ */ import_react5.default.createElement("select", { "aria-label": "\u67E5\u770B\u5206\u652F", value: ref, disabled: !!busy, onChange: (event) => {
    repo.setRef(event.target.value);
    repo.setLimit(100);
    setHash("");
    setSelection(null);
    setDetailOpen(false);
  } }, /* @__PURE__ */ import_react5.default.createElement("option", { value: "" }, "\u6240\u6709\u5206\u652F"), /* @__PURE__ */ import_react5.default.createElement("optgroup", { label: "\u672C\u5730\u5206\u652F" }, data.branches.filter((branch) => !branch.remote).map((branch) => /* @__PURE__ */ import_react5.default.createElement("option", { key: branch.ref, value: branch.ref }, branch.current ? "\u25CF " : "", branch.name))), /* @__PURE__ */ import_react5.default.createElement("optgroup", { label: "\u8FDC\u7A0B\u5206\u652F" }, data.branches.filter((branch) => branch.remote).map((branch) => /* @__PURE__ */ import_react5.default.createElement("option", { key: branch.ref, value: branch.ref }, branch.name)))), viewingBranch && !viewingBranch.remote && !viewingBranch.current && /* @__PURE__ */ import_react5.default.createElement("button", { disabled, title: `\u5207\u6362\u5230 ${viewingBranch.name}`, onClick: () => setConfirm(viewingBranch.ref) }, "\u5207\u6362")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-history-caption" }, normalized ? `\u5339\u914D ${commits.length} / ${data.commits.length} \u4E2A\u5DF2\u52A0\u8F7D\u63D0\u4EA4` : `\u6700\u8FD1 ${data.commits.length} \u4E2A\u63D0\u4EA4`, /* @__PURE__ */ import_react5.default.createElement("span", null, normalized ? "\u641C\u7D22\u7ED3\u679C" : "\u63D0\u4EA4\u56FE")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-history-scroll" }, commits.length ? commits.map(({ commit, index }) => /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-commit-row gv-list-focus" + (hash === commit.hash ? " gv-selected" : ""), "aria-pressed": hash === commit.hash, key: commit.hash, title: commit.subject, onClick: () => {
    setHash(commit.hash);
    setDetailOpen(true);
  } }, normalized ? /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-search-dot" }) : /* @__PURE__ */ import_react5.default.createElement(Graph, { row: graph.rows[index], width: Math.max(40, Math.min(180, graph.lanes * 14 + 18)) }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-commit-copy" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-subject" }, commit.subject || "\uFF08\u65E0\u63D0\u4EA4\u8BF4\u660E\uFF09"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-commit-meta" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-author" }, commit.author), /* @__PURE__ */ import_react5.default.createElement("time", { dateTime: commit.date }, dateLabel(commit.date)), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-hash" }, commit.hash.slice(0, 7))), commit.refs && /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-ref", title: commit.refs }, commit.refs.replace(/^HEAD -> /, ""))))) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-empty" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "commit", size: 30 }), /* @__PURE__ */ import_react5.default.createElement("strong", null, normalized ? "\u6CA1\u6709\u5339\u914D\u7684\u63D0\u4EA4" : "\u8FD8\u6CA1\u6709\u63D0\u4EA4"), /* @__PURE__ */ import_react5.default.createElement("p", null, normalized ? "\u8BD5\u8BD5\u63D0\u4EA4\u8BF4\u660E\u3001\u4F5C\u8005\u6216\u54C8\u5E0C\u3002\u641C\u7D22\u8303\u56F4\u662F\u5F53\u524D\u5DF2\u52A0\u8F7D\u7684\u5386\u53F2\u3002" : "\u6682\u5B58\u6587\u4EF6\u5E76\u521B\u5EFA\u7B2C\u4E00\u4E2A\u63D0\u4EA4\u540E\uFF0C\u5386\u53F2\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002"), normalized && /* @__PURE__ */ import_react5.default.createElement("button", { onClick: () => setCommitQuery("") }, "\u6E05\u9664\u641C\u7D22")), data.moreCommits && limit < 500 && /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-load-more", disabled: loading, onClick: () => repo.setLimit((value) => Math.min(500, value + 100)) }, loading ? "\u6B63\u5728\u52A0\u8F7D\u2026" : "\u518D\u52A0\u8F7D 100 \u4E2A\u63D0\u4EA4")))), /* @__PURE__ */ import_react5.default.createElement("section", { className: "gv-detail", "aria-label": "\u5DEE\u5F02\u8BE6\u60C5" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-detail-head" }, /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-icon-btn gv-back", "aria-label": "\u8FD4\u56DE\u5217\u8868", title: "\u8FD4\u56DE\u5217\u8868 \xB7 Esc", onClick: back }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "back" })), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-detail-name" }, /* @__PURE__ */ import_react5.default.createElement("strong", { title: selection?.path }, selectedName ?? (mode === "history" ? "\u63D0\u4EA4\u8BE6\u60C5" : "\u6587\u4EF6\u5DEE\u5F02")), selectedPath && /* @__PURE__ */ import_react5.default.createElement("small", { title: selectedPath }, selectedPath)), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-mode" }, selection?.mode === "staged" ? "\u5DF2\u6682\u5B58" : selection?.mode === "working" ? "\u5DE5\u4F5C\u533A" : mode === "history" ? "\u63D0\u4EA4" : ""), selection && mode === "working" && /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-detail-action", disabled, onClick: () => void write({ action: selection.mode === "staged" ? "unstage" : "stage", paths: [selection.path] }) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: selection.mode === "staged" ? "minus" : "plus", size: 14 }), selection.mode === "staged" ? "\u53D6\u6D88\u6682\u5B58" : "\u6682\u5B58\u6587\u4EF6")), mode === "history" && detail && /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-commit-card" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-commit-title" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "commit" }), /* @__PURE__ */ import_react5.default.createElement("strong", null, detail.commit.subject)), /* @__PURE__ */ import_react5.default.createElement("div", { className: "gv-commit-info" }, /* @__PURE__ */ import_react5.default.createElement("button", { className: "gv-copy-hash", title: "\u590D\u5236\u5B8C\u6574\u63D0\u4EA4\u54C8\u5E0C", onClick: () => void copyHash() }, detail.commit.hash.slice(0, 10), /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "copy", size: 12 })), /* @__PURE__ */ import_react5.default.createElement("span", null, detail.commit.author), /* @__PURE__ */ import_react5.default.createElement("time", { dateTime: detail.commit.date }, dateLabel(detail.commit.date))), detail.message !== detail.commit.subject && /* @__PURE__ */ import_react5.default.createElement("pre", null, detail.message), /* @__PURE__ */ import_react5.default.createElement("label", { className: "gv-commit-file-label" }, "\u4FEE\u6539\u6587\u4EF6", /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-number" }, detail.files.length), /* @__PURE__ */ import_react5.default.createElement("select", { "aria-label": "\u63D0\u4EA4\u4E2D\u7684\u6587\u4EF6", value: selection?.path ?? "", onChange: (event) => setSelection({ path: event.target.value, mode: "commit", hash }) }, !detail.files.length && /* @__PURE__ */ import_react5.default.createElement("option", { value: "" }, "\u8FD9\u4E2A\u63D0\u4EA4\u6CA1\u6709\u6587\u4EF6\u5DEE\u5F02"), detail.files.map((file) => /* @__PURE__ */ import_react5.default.createElement("option", { key: file.path, value: file.path }, STATUS[file.status[0]] ?? file.status, " \xB7 ", file.path))))), /* @__PURE__ */ import_react5.default.createElement(DiffView, { value: patch, loading: patchLoading || detailLoading, selected: !!selection, onMessage: repo.setNotice }))), /* @__PURE__ */ import_react5.default.createElement("footer", { className: "gv-footer" }, /* @__PURE__ */ import_react5.default.createElement("span", { title: data?.root }, busy ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "refresh", className: "gv-spin", size: 12 }), "\u6B63\u5728", busy, "\u2026") : repo.outdated ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "alert", size: 12 }), "\u72B6\u6001\u9700\u8981\u5237\u65B0") : loading ? "\u6B63\u5728\u5237\u65B0\u2026" : repo.updatedAt ? "\u5DF2\u66F4\u65B0 " + new Date(repo.updatedAt).toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : "\u672C\u5730 Git"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "gv-footer-root", title: data?.root }, data?.root.split("/").pop()), /* @__PURE__ */ import_react5.default.createElement("span", null, data?.head?.slice(0, 8) ?? "\u5C1A\u65E0\u63D0\u4EA4")), confirm && /* @__PURE__ */ import_react5.default.createElement(BranchDialog, { from: data?.branch ?? "", to: data?.branches.find((branch) => branch.ref === confirm)?.name ?? confirm, changes: data?.files.length ?? 0, onCancel: () => setConfirm(null), onConfirm: () => {
    const next = confirm;
    setConfirm(null);
    void write({ action: "switch", ref: next });
  } }));
}

// src/styles.ts
var css = `
.gv-root {
  --gv-bg:var(--dsw-alias-bg-layer-1,#fff);--gv-text:var(--dsw-alias-label-primary,#242933);
  --gv-muted:var(--dsw-alias-label-tertiary,#7b8290);--gv-line:var(--dsw-alias-border-l3,#e8ebf0);
  --gv-hover:var(--dsw-alias-interactive-bg-hover,#f3f5f8);--gv-accent:#4974dd;
  --gv-soft:color-mix(in srgb,var(--gv-text) 2.5%,var(--gv-bg));--gv-green:#31916d;--gv-red:#ca5966;
  container-type:inline-size;display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;
  overflow:hidden;position:relative;background:var(--gv-bg);color:var(--gv-text);font:13px/1.5 system-ui,-apple-system,sans-serif;
}
.gv-root *{box-sizing:border-box}.gv-root svg{flex:none}.gv-root button,.gv-root input,.gv-root select,.gv-root textarea{font:inherit;color:inherit}
.gv-root button{cursor:pointer;border:1px solid var(--gv-line);border-radius:7px;background:var(--gv-bg);padding:5px 9px;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:background .12s,border-color .12s}
.gv-root button:hover:not(:disabled){background:var(--gv-hover);border-color:color-mix(in srgb,var(--gv-text) 17%,var(--gv-line))}
.gv-root :is(button,input,select,textarea):focus-visible{outline:2px solid var(--gv-accent);outline-offset:2px}
.gv-root button:disabled{opacity:.42;cursor:not-allowed}.gv-root input,.gv-root textarea{accent-color:var(--gv-accent)}
.gv-root select{border:1px solid var(--gv-line);border-radius:7px;background:var(--gv-bg);max-width:100%;min-width:0;padding:6px 8px}
.gv-root .gv-icon-btn{width:28px;height:28px;padding:0;border:0;flex:none;background:transparent;color:var(--gv-muted);border-radius:6px}
.gv-root .gv-icon-btn:hover:not(:disabled),.gv-root .gv-icon-btn[aria-pressed=true]{background:var(--gv-hover);color:var(--gv-accent)}
.gv-root .gv-primary{background:var(--gv-accent);color:#fff;border-color:transparent;font-weight:550}.gv-root .gv-primary:hover:not(:disabled){background:#3b64c7;border-color:transparent}
.gv-root .gv-text-btn{border:0;background:transparent;font-size:11px;color:var(--gv-accent);padding:3px 5px;white-space:nowrap}
.gv-root .gv-checkbox{appearance:auto;margin:0;flex:none;width:14px;height:14px;cursor:pointer;border-radius:4px}
.gv-root kbd{font:10px/1.5 ui-monospace,monospace;color:var(--gv-muted);white-space:nowrap}
.gv-number{font:10px/1.5 ui-monospace,monospace;padding:1px 5px;border-radius:5px;background:var(--gv-hover);color:var(--gv-muted);font-weight:400}
.gv-header{flex:none;padding:15px 16px 12px;background:var(--gv-bg)}
.gv-heading{display:flex;align-items:center;gap:9px;margin-bottom:13px}.gv-heading strong{font-size:14px;font-weight:650;letter-spacing:.02em;flex:1}.gv-brand-icon{color:var(--gv-accent);display:inline-flex}.gv-version{font-size:10px;color:var(--gv-muted);border:1px solid var(--gv-line);border-radius:5px;padding:1px 5px}
.gv-toolbar{display:flex;align-items:center;gap:10px}.gv-project-label{font-size:11px;color:var(--gv-muted)}.gv-project{flex:1;width:0;font-size:12px!important}
.gv-summary{display:flex;align-items:center;gap:10px;min-width:0;margin-top:10px;font-size:11px}.gv-branch{display:inline-flex;align-items:center;gap:5px;max-width:60%;color:var(--gv-accent);font:11px ui-monospace,monospace}.gv-branch>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gv-dirty,.gv-clean{display:inline-flex;align-items:center;gap:5px;color:var(--gv-muted);white-space:nowrap}.gv-status-dot{width:5px;height:5px;border-radius:50%;background:#c59a45}.gv-clean .gv-status-dot{background:var(--gv-green)}.gv-tracking{margin-left:auto;white-space:nowrap;font:10px ui-monospace,monospace;color:var(--gv-muted)}
.gv-tabs{flex:none;display:flex;gap:20px;padding:0 16px;border-bottom:1px solid var(--gv-line)}.gv-root .gv-tabs button{gap:6px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent;color:var(--gv-muted);padding:10px 0 9px;font-size:12px}
.gv-root .gv-tabs .gv-active{border-bottom-color:var(--gv-accent);color:var(--gv-text);font-weight:600}.gv-active .gv-number{background:color-mix(in srgb,var(--gv-accent) 10%,transparent);color:var(--gv-accent)}
.gv-body{flex:1;min-height:0;min-width:0;display:grid;grid-template-columns:minmax(280px,.82fr) minmax(0,1.4fr)}
.gv-sidebar{min-height:0;min-width:0;display:flex;flex-direction:column;border-right:1px solid var(--gv-line);overflow:hidden;background:var(--gv-soft)}
.gv-search{display:flex;align-items:center;gap:7px;flex:none;padding:8px 12px;border-bottom:1px solid var(--gv-line);color:var(--gv-muted)}.gv-search input{width:0;flex:1;min-width:0;border:0;background:transparent;padding:5px 1px;font-size:12px;outline-offset:0!important}.gv-search input::placeholder{color:var(--gv-muted);opacity:.85}.gv-search kbd{border:1px solid var(--gv-line);border-radius:4px;padding:0 4px}.gv-search .gv-icon-btn{height:22px;width:22px}
.gv-file-scroll,.gv-history-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.gv-file-group{padding-bottom:5px}.gv-section-head{display:flex;align-items:center;gap:7px;padding:12px 12px 6px}.gv-root .gv-group-toggle{flex:1;justify-content:flex-start;min-width:0;border:0;padding:2px 0;color:var(--gv-muted);font-size:11px;font-weight:600;background:transparent;gap:5px}.gv-rotate{transform:rotate(90deg)}
.gv-file{display:flex;align-items:center;gap:7px;padding:0 7px 0 11px;margin:2px 5px;border:1px solid transparent;border-radius:7px;min-width:0;position:relative}
.gv-file:hover{background:var(--gv-hover)}.gv-file.gv-selected{background:color-mix(in srgb,var(--gv-accent) 7%,var(--gv-bg));border-color:color-mix(in srgb,var(--gv-accent) 19%,transparent)}.gv-file.gv-checked{background:color-mix(in srgb,var(--gv-accent) 5%,var(--gv-bg))}
.gv-root .gv-file-main{flex:1;min-width:0;border:0;background:transparent!important;justify-content:flex-start;gap:8px;padding:8px 0;text-align:left}.gv-file-main>svg{color:var(--gv-muted)}.gv-file-copy{display:flex;flex-direction:column;min-width:0;flex:1;gap:1px}.gv-file-name{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gv-file-dir{font-size:10px;color:var(--gv-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4}
.gv-status{font-size:9px;white-space:nowrap;color:#b18433;padding:1px 4px;border-radius:4px;background:color-mix(in srgb,#c2953e 8%,transparent)}.gv-status[data-status=A],.gv-status[data-status="?"]{color:var(--gv-green);background:color-mix(in srgb,var(--gv-green) 8%,transparent)}.gv-status[data-status=D],.gv-status[data-status=U]{color:var(--gv-red);background:color-mix(in srgb,var(--gv-red) 8%,transparent)}
.gv-root .gv-file-action{width:25px;height:25px;color:var(--gv-muted)}.gv-root .gv-file-action:hover{color:var(--gv-accent);background:var(--gv-bg)}
.gv-bulk-bar{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:7px 12px;border-bottom:1px solid var(--gv-line);background:color-mix(in srgb,var(--gv-accent) 5%,var(--gv-bg));font-size:10px;color:var(--gv-accent)}.gv-bulk-bar>span{margin-right:auto}.gv-bulk-bar button{font-size:10px;padding:2px 5px}.gv-bulk-bar .gv-icon-btn{width:20px;height:20px}
.gv-empty-small{padding:10px 15px 14px 32px;color:var(--gv-muted);font-size:11px;line-height:1.8}.gv-empty-small button{margin-left:5px;font-size:11px}.gv-filter-empty{text-align:center;padding:18px;color:var(--gv-muted);font-size:12px}.gv-filter-empty button{font-size:11px}
.gv-clean-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;gap:7px;padding:25px}.gv-clean-state>span{display:flex;align-items:center;justify-content:center;width:45px;height:45px;border-radius:14px;color:var(--gv-green);background:color-mix(in srgb,var(--gv-green) 8%,transparent);margin-bottom:5px}.gv-clean-state strong{font-size:13px;font-weight:500}.gv-clean-state p{margin:0;color:var(--gv-muted);font-size:11px}
.gv-commit-form{padding:13px 14px 14px;border-top:1px solid var(--gv-line);background:var(--gv-bg);flex:none}.gv-commit-form>label{display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:550;margin-bottom:7px}.gv-commit-form>label span{font-size:10px;font-weight:400;color:var(--gv-muted)}
.gv-commit-form textarea{display:block;width:100%;height:72px;min-height:54px;max-height:160px;resize:vertical;border:1px solid var(--gv-line);border-radius:7px;padding:9px 10px;background:var(--gv-soft);font-size:12px;line-height:1.65}.gv-commit-form textarea::placeholder{color:var(--gv-muted)}.gv-commit-hint{display:flex;align-items:center;justify-content:space-between;gap:5px;margin:7px 0 10px;font-size:10px;color:var(--gv-muted)}.gv-root .gv-submit{width:100%;height:33px;font-size:12px}
.gv-detail{min-height:0;min-width:0;display:flex;flex-direction:column;background:var(--gv-bg);overflow:hidden}.gv-detail-head{display:flex;align-items:center;gap:9px;min-height:60px;padding:11px 14px;border-bottom:1px solid var(--gv-line);flex:none}.gv-detail-name{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}.gv-detail-name strong{font-size:12px;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gv-detail-name small{font-size:10px;color:var(--gv-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gv-mode{font-size:10px;color:var(--gv-muted);white-space:nowrap;padding:2px 6px;border:1px solid var(--gv-line);border-radius:4px}.gv-root .gv-detail-action{font-size:11px;padding:4px 7px;white-space:nowrap}.gv-root .gv-back{display:none}
.gv-empty{flex:1;min-height:120px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:9px;padding:25px;text-align:center;color:var(--gv-muted)}.gv-empty>svg{opacity:.55;margin-bottom:4px}.gv-empty strong{color:var(--gv-text);font-size:13px;font-weight:500}.gv-empty p{margin:0;max-width:280px;font-size:11px;line-height:1.8}
.gv-message{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;font-size:11px;flex:none;border-bottom:1px solid var(--gv-line)}.gv-message>svg{margin-top:2px}.gv-message>span,.gv-message>div{flex:1;min-width:0}.gv-message p{white-space:pre-wrap;overflow-wrap:anywhere;margin:2px 0;font-size:11px;max-height:90px;overflow:auto}.gv-message strong{font-weight:600}.gv-message>.gv-icon-btn{width:20px;height:20px;margin-top:-1px}.gv-success{color:var(--gv-green);background:color-mix(in srgb,var(--gv-green) 5%,var(--gv-bg))}.gv-error{color:var(--gv-red);background:color-mix(in srgb,var(--gv-red) 5%,var(--gv-bg))}
.gv-diff-toolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-height:39px;padding:6px 11px;border-bottom:1px solid var(--gv-line);background:var(--gv-soft);flex:none;font-size:10px}.gv-diff-toolbar .gv-icon-btn{width:25px;height:25px}.gv-diff-stats{display:flex;gap:6px;font:10px ui-monospace,monospace}.gv-added{color:var(--gv-green)}.gv-deleted{color:var(--gv-red)}.gv-segment{display:flex;border:1px solid var(--gv-line);border-radius:5px;padding:1px;background:var(--gv-bg)}.gv-root .gv-segment button{border:0;padding:2px 7px;font-size:10px;border-radius:3px;background:transparent;color:var(--gv-muted)}.gv-root .gv-segment button[aria-pressed=true]{background:var(--gv-hover);color:var(--gv-text)}.gv-toolbar-spacer{flex:1}.gv-code-glyph{font:15px ui-monospace,monospace;line-height:1}.gv-hunk-nav{display:flex;align-items:center;gap:2px;border-left:1px solid var(--gv-line);padding-left:7px;color:var(--gv-muted)}.gv-hunk-nav>span{font:10px ui-monospace,monospace}
.gv-diff{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;font:12px/22px ui-monospace,SFMono-Regular,Consolas,monospace;tab-size:4;outline-offset:-2px!important}.gv-diff-table{border-collapse:collapse;min-width:100%;width:max-content}.gv-diff-table td,.gv-diff-table th{padding:0;vertical-align:top}.gv-diff-table thead{position:sticky;top:0;z-index:1;background:var(--gv-bg)}.gv-diff-table th{font:10px/25px system-ui;color:var(--gv-muted);text-align:left;border-bottom:1px solid var(--gv-line);font-weight:400}.gv-diff-table .gv-num{width:35px;min-width:35px;color:var(--gv-muted);user-select:none;text-align:right;padding:0 7px;border-right:1px solid color-mix(in srgb,var(--gv-line) 60%,transparent);font-size:10px;white-space:nowrap}.gv-diff-table .gv-code-heading{padding-left:11px}.gv-diff-table .gv-code{padding:0 11px;white-space:pre}.gv-wrap .gv-diff-table{table-layout:fixed;width:100%}.gv-wrap .gv-code{white-space:pre-wrap;overflow-wrap:anywhere}.gv-diff-split .gv-diff-table{min-width:560px}.gv-diff-split.gv-wrap .gv-diff-table{min-width:0}.gv-diff-split .gv-code-column{width:calc((100% - 70px)/2)}
.gv-diff-add{background:color-mix(in srgb,var(--gv-green) 10%,transparent)}.gv-diff-del{background:color-mix(in srgb,var(--gv-red) 10%,transparent)}.gv-diff-hunk{color:#6c8ece;background:color-mix(in srgb,#5487e7 7%,transparent);font-size:10px}.gv-diff-meta{color:var(--gv-muted);font-size:10px}.gv-diff-blank{background:var(--gv-soft)}.gv-diff-note{padding:10px 14px;color:var(--gv-muted);font:11px/1.7 system-ui;border-top:1px solid var(--gv-line)}
.gv-history-filter{display:flex;align-items:center;gap:7px;padding:9px 12px 8px;color:var(--gv-muted);flex:none}.gv-history-filter select{flex:1;font-size:11px;border:0;background:transparent;padding:4px 0}.gv-history-filter button{font-size:11px;padding:3px 7px;background:var(--gv-bg)}.gv-history-caption{display:flex;justify-content:space-between;padding:3px 13px 8px;color:var(--gv-muted);font-size:10px}
.gv-root .gv-commit-row{width:100%;min-height:62px;padding:0;border:0;border-radius:0;background:transparent;display:flex;justify-content:flex-start;align-items:stretch;text-align:left;gap:0}.gv-root .gv-commit-row:hover,.gv-root .gv-commit-row.gv-selected{background:var(--gv-hover)}.gv-root .gv-commit-row.gv-selected{box-shadow:inset 2px 0 var(--gv-accent)}.gv-graph{flex:none;align-self:stretch;overflow:hidden}.gv-commit-copy{min-width:0;flex:1;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:8px 12px 8px 0}.gv-subject{font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gv-commit-meta{display:flex;align-items:center;gap:7px;color:var(--gv-muted);font-size:10px;min-width:0}.gv-author{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}.gv-commit-meta time{white-space:nowrap}.gv-hash{font:10px ui-monospace,monospace;margin-left:auto;color:var(--gv-muted)}.gv-ref{font-size:9px;color:var(--gv-accent);background:color-mix(in srgb,var(--gv-accent) 8%,transparent);border-radius:3px;padding:1px 4px;max-width:100%;align-self:flex-start;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4}.gv-search-dot{width:6px;height:6px;border-radius:50%;background:var(--gv-accent);flex:none;margin:25px 14px 0}.gv-root .gv-load-more{width:calc(100% - 24px);margin:10px 12px;font-size:11px}
.gv-commit-card{flex:none;max-height:240px;overflow:auto;padding:14px;border-bottom:1px solid var(--gv-line)}.gv-commit-title{display:flex;align-items:flex-start;gap:8px}.gv-commit-title>svg{color:var(--gv-accent);margin-top:3px}.gv-commit-title strong{font-size:13px;font-weight:600;line-height:1.65;overflow-wrap:anywhere}.gv-commit-info{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:10px;color:var(--gv-muted);margin-top:6px}.gv-root .gv-copy-hash{font:10px ui-monospace,monospace;border:0;padding:2px 0;color:var(--gv-accent);background:transparent}.gv-commit-card pre{font:11px/1.8 system-ui;white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0}.gv-commit-file-label{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--gv-muted);flex-wrap:wrap;margin-top:12px}.gv-commit-file-label select{width:100%;font-size:11px;margin-top:2px;color:var(--gv-text)}
.gv-footer{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 12px;min-height:28px;font-size:10px;color:var(--gv-muted);border-top:1px solid var(--gv-line);background:var(--gv-soft)}.gv-footer>span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.gv-footer .gv-footer-root{min-width:0;display:block;overflow:hidden;text-overflow:ellipsis;margin-left:auto}.gv-footer>span:last-child{font:10px ui-monospace,monospace}
.gv-modal-cover{position:absolute;inset:0;background:#11182755;z-index:10;display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(2px)}.gv-dialog{background:var(--gv-bg);border:1px solid var(--gv-line);border-radius:12px;padding:21px;box-shadow:0 18px 60px #0003;width:min(360px,100%)}.gv-dialog-heading{display:flex;align-items:center;gap:10px;color:var(--gv-accent);margin-bottom:17px}.gv-dialog h3{margin:0;color:var(--gv-text);font-size:15px;font-weight:600}.gv-branch-transition{display:flex;align-items:center;gap:8px;padding:11px;border:1px solid var(--gv-line);border-radius:7px;background:var(--gv-soft);font:11px ui-monospace,monospace}.gv-branch-transition>span,.gv-branch-transition>strong{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;flex:1}.gv-branch-transition>strong{color:var(--gv-accent);font-weight:500}.gv-dialog p{font-size:12px;line-height:1.8;color:var(--gv-muted);margin:13px 0 0}.gv-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.gv-guide{width:100%;min-height:75px;border:1px solid var(--dsw-alias-border-l3,#e3e7ed);border-radius:10px;display:flex;align-items:center;gap:15px;padding:16px 20px;background:transparent;color:inherit;text-align:left;cursor:pointer}.gv-guide:hover{background:var(--dsw-alias-interactive-bg-hover,#f5f6f8)}.gv-guide>svg{color:#6588ed}.gv-guide strong{display:block;font-size:14px;font-weight:500}.gv-guide small{display:block;font-size:11px;opacity:.6;margin-top:3px}.gv-tab-title{display:inline-flex;align-items:center;gap:6px}
.gv-spin{animation:gv-spin 1.2s linear infinite}@keyframes gv-spin{to{transform:rotate(360deg)}}
@container (max-width:700px){
  .gv-body{display:flex;flex-direction:column}.gv-sidebar{flex:1;border-right:0}.gv-detail{display:none;flex:1}.gv-detail-open .gv-detail{display:flex}.gv-detail-open .gv-sidebar{display:none}.gv-root .gv-back{display:inline-flex}
  .gv-header{padding:12px 14px 10px}.gv-heading{margin-bottom:10px}.gv-diff-toolbar{gap:5px;padding:5px 10px}.gv-commit-form{padding:11px 14px 13px}.gv-file-main{min-height:49px}.gv-dialog{max-width:340px}
}
@container (max-width:370px){.gv-diff-toolbar .gv-hunk-nav{margin-left:auto;border:0;padding-left:0}.gv-commit-hint kbd{display:none}.gv-detail-head{padding:10px;gap:5px}.gv-mode{display:none}.gv-commit-meta{gap:5px}}
@media(prefers-reduced-motion:reduce){.gv-root *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

// src/client.tsx
var inject = ["slots", "sidebarRightTabs", "sidebarRight", "connection"];
var name = "git-visual-client";
function GitGuide({ useTabInfo }) {
  const { tab } = useTabInfo();
  return /* @__PURE__ */ import_react6.default.createElement("button", { className: "gv-guide", onClick: () => tab.actions.openTab("git-visual", { replaceTab: true }) }, /* @__PURE__ */ import_react6.default.createElement(GitIcon, { size: 28 }), /* @__PURE__ */ import_react6.default.createElement("span", null, /* @__PURE__ */ import_react6.default.createElement("strong", null, "Git \u4ED3\u5E93"), /* @__PURE__ */ import_react6.default.createElement("small", null, "\u63D0\u4EA4\u56FE\u3001\u6587\u4EF6\u5DEE\u5F02\u3001\u6682\u5B58\u548C\u63D0\u4EA4")));
}
function GitTitle() {
  return /* @__PURE__ */ import_react6.default.createElement("span", { className: "gv-tab-title" }, /* @__PURE__ */ import_react6.default.createElement(GitIcon, { size: 15 }), "Git");
}
function apply(ctx) {
  if (!hostMethodsAvailable("dsh-git-visual/client", ctx, ["effect", "slots.inject", "slots.register", "sidebarRightTabs.register", "connection.rpc.call"])) return;
  const id = "dsh-git-visual";
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.plugin = id;
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, "git-visual.styles");
  const call = async (request, signal) => {
    const response = await ctx.connection.rpc.call("/api", "gitVisual/request", { args: { request } }, signal);
    if (!response.ok) throw new Error(response.error?.message ?? "Git \u8BF7\u6C42\u5931\u8D25");
    return response.value;
  };
  ctx.effect(() => ctx.sidebarRightTabs.register({ id, kind: "git-visual", multiple: false, title: () => "Git", guide: [{ id: "repository", order: 25, title: () => "Git \u4ED3\u5E93", description: () => "\u63D0\u4EA4\u56FE\u3001\u5DEE\u5F02\u548C\u7248\u672C\u7BA1\u7406", icon: GitIcon }] }), "git-visual.type");
  ctx.effect(() => ctx.slots.inject("sidebar.right.tab.guide.entry", () => ctx.slots.register({ name: "sidebar.right.tab.guide.entry", key: id }, GitGuide)), "git-visual.guide");
  ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({ name: "sidebar.right.pane.tab", key: id, inject: (sessionId) => ({ call, sessionId }) }, GitPanel)), "git-visual.body");
  ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({ name: "sidebar.right.pane.tab.title", key: id }, GitTitle)), "git-visual.title");
}
return module.exports;}});
