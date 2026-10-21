export interface DiffLine {
    id: number;
    text: string;
    kind: 'meta' | 'hunk' | 'add' | 'del' | 'context';
    old: number | null;
    next: number | null;
}
export interface SplitLine {
    id: number;
    header?: DiffLine;
    left?: DiffLine;
    right?: DiffLine;
}
export declare function parseDiff(patch: string): {
    lines: DiffLine[];
    added: number;
    deleted: number;
    hunks: number;
};
export declare function splitDiff(lines: DiffLine[]): SplitLine[];
