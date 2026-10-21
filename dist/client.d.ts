type Dispose = () => void;
interface ClientContext {
    effect(effect: () => unknown, label?: string): unknown;
    slots: {
        inject(name: string, effect: () => unknown): Dispose;
        register(options: object, component: Function): Dispose;
    };
    sidebarRightTabs: {
        register(definition: object): Dispose;
    };
    connection: {
        rpc: {
            call(path: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{
                ok: boolean;
                value?: unknown;
                error?: {
                    message: string;
                };
            }>;
        };
    };
}
export declare const inject: string[];
export declare const name = "git-visual-client";
export declare function apply(ctx: ClientContext): void;
export {};
