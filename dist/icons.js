import React from 'react';
const paths = {
    git: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M6 5v14m0-9c0 4 12 0 12 5v4" }),
        React.createElement("circle", { cx: "6", cy: "4", r: "2" }),
        React.createElement("circle", { cx: "6", cy: "20", r: "2" }),
        React.createElement("circle", { cx: "18", cy: "20", r: "2" })),
    file: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
        React.createElement("path", { d: "M14 3v6h6" })),
    search: React.createElement(React.Fragment, null,
        React.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }),
        React.createElement("path", { d: "m16 16 5 5" })),
    refresh: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M20 7v5h-5M4 17v-5h5" }),
        React.createElement("path", { d: "M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1" })),
    check: React.createElement("path", { d: "m5 12 4 4L19 6" }), plus: React.createElement("path", { d: "M12 5v14M5 12h14" }), minus: React.createElement("path", { d: "M5 12h14" }),
    back: React.createElement("path", { d: "m13 5-7 7 7 7M6 12h15" }), close: React.createElement("path", { d: "m6 6 12 12M6 18 18 6" }),
    chevron: React.createElement("path", { d: "m9 5 7 7-7 7" }), copy: React.createElement(React.Fragment, null,
        React.createElement("rect", { x: "8", y: "8", width: "12", height: "13", rx: "2" }),
        React.createElement("path", { d: "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" })),
    commit: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M2 12h5m10 0h5" }),
        React.createElement("circle", { cx: "12", cy: "12", r: "5" })),
    wrap: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M3 6h18M3 11h13a4 4 0 0 1 0 8h-5m3-3-3 3 3 3M3 16h3" })),
    up: React.createElement("path", { d: "m6 15 6-6 6 6" }), down: React.createElement("path", { d: "m6 9 6 6 6-6" }),
    alert: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "m12 3 10 18H2zM12 9v5" }),
        React.createElement("path", { d: "M12 17h.01" })),
};
export function Icon({ name, size = 16, className = '' }) {
    return React.createElement("svg", { width: size, height: size, className: className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, paths[name]);
}
export function GitIcon({ size = 20 }) { return React.createElement(Icon, { name: "git", size: size }); }
