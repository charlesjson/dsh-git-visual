import React from 'react';
export declare function BranchDialog({ from, to, changes, onCancel, onConfirm }: {
    from: string;
    to: string;
    changes: number;
    onCancel(): void;
    onConfirm(): void;
}): React.JSX.Element;
