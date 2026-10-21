import type { GitCommit } from './types.js';
export interface GraphRow {
    lane: number;
    color: number;
    incoming: boolean;
    through: {
        from: number;
        to: number;
        color: number;
    }[];
    parents: {
        to: number;
        color: number;
    }[];
}
/** Carry live parent lanes through topological rows, joining existing lanes at merges. */
export declare function layoutGraph(commits: GitCommit[]): {
    rows: GraphRow[];
    lanes: number;
};
