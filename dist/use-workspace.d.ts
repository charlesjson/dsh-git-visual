import type { GitCall, GitRequest, GitSnapshot } from './types.js';
export interface WorkspaceList {
    workspaces: {
        id: string;
        title: string;
        path: string;
    }[];
    selected?: string;
}
export declare const errorText: (error: unknown) => string;
export declare function useWorkspace(call: GitCall, sessionId: string): {
    workspaces: {
        id: string;
        title: string;
        path: string;
    }[];
    workspace: string;
    data: GitSnapshot | null;
    ref: string;
    setRef: import("react").Dispatch<import("react").SetStateAction<string>>;
    limit: number;
    setLimit: import("react").Dispatch<import("react").SetStateAction<number>>;
    loading: boolean;
    busy: string;
    error: string;
    setError: import("react").Dispatch<import("react").SetStateAction<string>>;
    notice: string;
    setNotice: import("react").Dispatch<import("react").SetStateAction<string>>;
    outdated: boolean;
    updatedAt: number | null;
    chooseWorkspace: (id: string) => void;
    refresh: () => Promise<void> | Promise<GitSnapshot | null>;
    mutate: (request: GitRequest) => Promise<boolean>;
};
