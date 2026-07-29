// @ts-nocheck — vendored from typescript-go, see GENERATED.md
/**
 * Shared utilities for the TypeScript API client.
 */

function getExePath(): string {
    throw new Error("resolveExePath is not supported in the browser build");
}
import type { FileSystem } from "./fs.ts";
import type { MessageConnection } from "vscode-jsonrpc";

export interface ClientSocketOptions {
    /** Path to the Unix domain socket or Windows named pipe for API communication */
    pipe: string;
}

export interface ClientSpawnOptions {
    /** Injected JSON-RPC connection to a running tsgo server (browser transport). */
    connection?: MessageConnection;
    /** Path to the tsgo executable. Defaults to the bundled tsgo binary. */
    tsserverPath?: string;
    /** Current working directory */
    cwd?: string;
    /** Virtual filesystem callbacks */
    fs?: FileSystem;
    /**
     * When true, collect timing information for each request. The client
     * measures round-trip latency and bytes sent/received, and the server
     * measures its own per-request processing time; both are combined (along
     * with an estimated transport overhead) in the snapshot returned by
     * {@link API.getTimingInfo}.
     */
    collectTiming?: boolean;
}

export type ClientOptions = ClientSocketOptions | ClientSpawnOptions;

export function isSpawnOptions(options: ClientOptions): options is ClientSpawnOptions {
    return !("pipe" in options);
}

export function resolveExePath(options: ClientSpawnOptions): string {
    return options.tsserverPath ?? getExePath();
}

export interface LSPConnectionOptions extends ClientSocketOptions {
}

export interface APIOptions extends ClientSpawnOptions {
}
