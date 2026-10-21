import React from 'react';
import type { GitCall } from './types.js';
import { GitIcon } from './icons.js';
import { DiffView } from './diff-view.js';
export { GitIcon, DiffView };
export declare function GitPanel({ call, sessionId }: {
    call: GitCall;
    sessionId: string;
}): React.JSX.Element;
