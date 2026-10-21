import React from 'react';
import type { GitDiff } from './types.js';
export declare function DiffView({ value, loading, selected, onMessage }: {
    value: GitDiff | null;
    loading: boolean;
    selected?: boolean;
    onMessage?(message: string): void;
}): React.JSX.Element;
