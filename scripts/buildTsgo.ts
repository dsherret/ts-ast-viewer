// Builds everything the app needs to run TypeScript 7.0 (the native `tsgo` port)
// entirely in the browser, from a single pinned typescript-go commit:
//
//   1. the compiler itself as a WebAssembly module (src/resources/tsgo/tsgo.wasm), and
//   2. the JS AST/decoder/async-API client, vendored from the SAME commit into
//      src/compiler/ts7/vendor/native-preview (so the client and the wasm server
//      can never drift out of protocol sync).
//
// This deliberately does NOT use the published npm @typescript/native-preview
// package: that pins a stale dev build unrelated to our wasm, and pulls per-platform
// native binaries we don't use. Building both artifacts from one commit is the whole
// point — bump TSGO_COMMIT and re-run to move to a newer nightly.
//
// tsgo has no wasm target upstream, so we build one ourselves and apply a one-line
// patch so the `--api` server handles requests inline (see PATCH below) — required
// because the wasm runs single-instance under JSPI, where a suspended stdin read
// freezes the whole module and would otherwise starve the async server's per-request
// goroutine.
//
// Requires Go (>= the version in tsgo's go.mod; `GOTOOLCHAIN=auto` will fetch it)
// and git on PATH. Pass `--skip-wasm` to only re-vendor the JS client (fast).
import $ from "@david/dax";
import * as path from "node:path";

// Pinned typescript-go commit both artifacts are built from.
const TSGO_COMMIT = "d35cc5f485640a41fbbf5a2267e9b11c7a7db4dc";
const REPO = "https://github.com/microsoft/typescript-go.git";

const root = path.resolve(import.meta.dirname!, "..");
const wasmOutDir = path.join(root, "src/resources/tsgo");
const vendorOutDir = path.join(root, "src/compiler/ts7/vendor/native-preview");
const workDir = path.join(root, ".tsgo-build");
const skipWasm = Deno.args.includes("--skip-wasm");

await $`git --version`.quiet();
if (!skipWasm) await $`go version`.quiet();

const repoDir = await checkoutTsgo();
await vendorClient(repoDir);
if (!skipWasm) await buildWasm(repoDir);

/** Sparse-clone typescript-go at the pinned commit (reused across runs). */
async function checkoutTsgo(): Promise<string> {
  const repoDir = path.join(workDir, "typescript-go");
  if (!(await $.path(repoDir).exists())) {
    $.logStep("Cloning", `typescript-go @ ${TSGO_COMMIT.slice(0, 8)}`);
    await $`git clone --filter=blob:none --no-checkout ${REPO} ${repoDir}`;
    await $`git sparse-checkout init --no-cone`.cwd(repoDir);
    // everything except the huge conformance fixtures
    await $.path(path.join(repoDir, ".git/info/sparse-checkout"))
      .writeText("/*\n!/internal/testdata/\n!/testdata/\n!/_submodules/\n");
  }
  await $`git fetch --depth 1 origin ${TSGO_COMMIT}`.cwd(repoDir).quiet();
  await $`git checkout ${TSGO_COMMIT}`.cwd(repoDir);
  return repoDir;
}

/**
 * Vendor the native-preview JS client (`_packages/native-preview/src`) into the
 * repo, rewriting the handful of Node-only imports so it runs in the browser:
 *  - `#enums/x`      → the relative `.enum.ts` (a real TS enum: values + types),
 *  - `#getExePath`   → a stub (only the unused spawn path needs it),
 *  - `node:buffer`   → dropped (wtf8's one use becomes `Uint8Array.includes`),
 *  - the async transport `client.ts` → our browser/JSPI version (see below).
 * The sync channel and Node client are skipped entirely.
 */
async function vendorClient(repoDir: string) {
  const srcRoot = path.join(repoDir, "_packages/native-preview/src");
  $.logStep("Vendoring", `native-preview client → ${path.relative(root, vendorOutDir)}`);
  await $.path(vendorOutDir).remove({ recursive: true }).catch(() => {});
  await $.path(vendorOutDir).ensureDir();

  const enumsDir = path.join(vendorOutDir, "enums");
  for await (const entry of walkTs(srcRoot)) {
    const rel = path.relative(srcRoot, entry).replaceAll("\\", "/");
    if (rel.startsWith("api/sync/") || rel === "api/syncChannel.ts") continue; // Node-only, unused
    if (rel.startsWith("enums/") && !rel.endsWith(".enum.ts")) continue; // keep only the real enums
    if (rel === "api/async/client.ts") continue; // replaced with our browser transport below

    const outPath = path.join(vendorOutDir, rel);
    await $.path(path.dirname(outPath)).ensureDir();
    await $.path(outPath).writeText(rewrite(rel, await $.path(entry).readText(), path.dirname(outPath), enumsDir));
  }

  await $.path(path.join(vendorOutDir, "api/async/client.ts")).writeText(browserClientSource());
  await $.path(path.join(vendorOutDir, "GENERATED.md")).writeText(attribution());
  await $.path(path.join(vendorOutDir, "..", "tsgo.commit")).writeText(TSGO_COMMIT + "\n");
}

/** Apply the per-file import rewrites that make a vendored source browser-safe. */
function rewrite(rel: string, text: string, fileDir: string, enumsDir: string): string {
  // vendored generated code; not ours to satisfy this repo's strict tsconfig.
  text = `// @ts-nocheck — vendored from typescript-go, see GENERATED.md\n${text}`;

  // #enums/checkFlags → ../../enums/checkFlags.enum.ts (relative to this file)
  text = text.replaceAll(/(["'])#enums\/([A-Za-z0-9_]+)\1/g, (_m, q, name) => {
    const target = path.relative(fileDir, path.join(enumsDir, `${name}.enum.ts`)).replaceAll("\\", "/");
    return `${q}${target.startsWith(".") ? target : "./" + target}${q}`;
  });

  if (rel === "api/options.ts") {
    // getExePath resolves the native binary — never reached in the browser (no spawn).
    text = text.replace(
      `import getExePath from "#getExePath";`,
      `function getExePath(): string {\n    throw new Error("resolveExePath is not supported in the browser build");\n}`,
    );
    // let the API carry an injected JSON-RPC connection (see client.ts)
    text = text.replace(
      `import type { FileSystem } from "./fs.ts";`,
      `import type { FileSystem } from "./fs.ts";\nimport type { MessageConnection } from "vscode-jsonrpc";`,
    ).replace(
      `export interface ClientSpawnOptions {`,
      `export interface ClientSpawnOptions {\n    /** Injected JSON-RPC connection to a running tsgo server (browser transport). */\n    connection?: MessageConnection;`,
    );
  }

  if (rel === "api/node/wtf8.ts") {
    text = text
      .replace(/import \{ Buffer \} from "node:buffer";\r?\n/, "")
      .replace(
        `    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).indexOf(surrogateLeadByte) >= 0;`,
        `    return bytes.includes(surrogateLeadByte);`,
      )
      .replaceAll("NodeJS.AllowSharedBufferSource", "ArrayBufferView | ArrayBuffer");
  }

  if (rel === "api/node/encoder.ts") {
    // Node Buffer isn't available in the browser; encode base64 from the bytes directly.
    text = text.replace(
      `    return Buffer.from(data).toString("base64");`,
      `    let binary = "";\n    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);\n    return btoa(binary);`,
    );
  }

  return text;
}

async function* walkTs(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory) yield* walkTs(full);
    else if (entry.name.endsWith(".ts")) yield full;
  }
}

async function buildWasm(repoDir: string) {
  await applyInlineHandlerPatch(path.join(repoDir, "internal/api/conn_async.go"));
  $.logStep("Building", "tsgo.wasm (GOOS=wasip1 GOARCH=wasm) — this takes a few minutes");
  await $.path(wasmOutDir).ensureDir();
  const outFile = path.join(wasmOutDir, "tsgo.wasm");
  await $`go build -o ${outFile} ./cmd/tsgo`
    .cwd(repoDir)
    .env({ GOOS: "wasip1", GOARCH: "wasm", GOTOOLCHAIN: "auto" });
  const size = (await $.path(outFile).stat())!.size;
  $.log(`Wrote ${outFile} (${(size / 1024 / 1024).toFixed(0)} MB)`);
}

/** Make the api server handle each request inline instead of in a goroutine. */
async function applyInlineHandlerPatch(file: string) {
  const p = $.path(file);
  let text = await p.readText();
  if (text.includes("ts-ast-viewer patch")) {
    $.log("Patch already applied");
    return;
  }
  const original = `		} else if msg.IsRequest() {
			go c.handleRequest(ctx, msg)
		} else if msg.IsNotification() {
			go c.handleNotification(ctx, msg)
		}`;
  const patched = `		} else if msg.IsRequest() {
			// ts-ast-viewer patch: handle inline (no goroutine) so the server works when
			// driven over a single-instance JSPI wasm stdin, where a suspending fd_read
			// freezes the whole instance and would starve a background handler goroutine.
			c.handleRequest(ctx, msg)
		} else if msg.IsNotification() {
			c.handleNotification(ctx, msg)
		}`;
  if (!text.includes(original)) {
    throw new Error(`Could not find the dispatch block to patch in ${file}. The pinned commit may have changed.`);
  }
  text = text.replace(original, patched);
  await p.writeText(text);
  $.logStep("Patched", "internal/api/conn_async.go (inline api handler)");
}

function attribution() {
  return `# Vendored from microsoft/typescript-go

These files are generated by \`deno task buildTsgo\` from
\`_packages/native-preview/src\` at commit ${TSGO_COMMIT} (Apache-2.0, © Microsoft).

Do not edit by hand — re-run the task to update. The only local changes are the
import rewrites documented in scripts/buildTsgo.ts (Node-only imports made
browser-safe) and api/async/client.ts, which is our JSPI transport.
`;
}

// Our replacement for native-preview's Node client (which spawns a child process
// and talks over its stdio). Here the tsgo server runs as tsgo.wasm in-process and
// the app injects a JSON-RPC connection over its stdin/stdout (see bootTsgoWasm.ts).
// Source files reach the compiler through the wasm's in-memory filesystem, so no
// server→client FS callbacks are registered. The public surface matches the pieces
// api/async/api.ts depends on: apiRequest, apiRequestBinary, close, and timing.
function browserClientSource() {
  return `// Generated by scripts/buildTsgo.ts — browser/JSPI transport (not upstream).
import {
    type MessageConnection,
    RequestType,
} from "vscode-jsonrpc";
import type {
    ClientOptions,
    ClientSocketOptions,
    ClientSpawnOptions,
} from "../options.ts";
import {
    combineTimingInfo,
    disabledServerTimingInfo,
    disabledTimingInfo,
    type ServerTimingInfo,
    TimingCollector,
    type TimingInfo,
} from "../timing.ts";

export type { ClientOptions, ClientSocketOptions, ClientSpawnOptions };

/**
 * Communicates with a tsgo \`--api --async\` server over an injected JSON-RPC
 * connection. In the browser the server is tsgo.wasm and the connection is built
 * on top of its JSPI stdio; the connection is supplied via \`options.connection\`.
 */
export class Client {
    private connection: MessageConnection | undefined;
    private options: ClientSpawnOptions;
    private connected = false;
    private timing: TimingCollector | undefined;

    constructor(options: ClientOptions) {
        this.options = options as ClientSpawnOptions;
        if (this.options.collectTiming) {
            this.timing = new TimingCollector();
        }
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        const connection = this.options.connection;
        if (!connection) {
            throw new Error("No JSON-RPC connection was injected (options.connection). "
                + "The browser build cannot spawn a tsgo process.");
        }
        this.connection = connection;
        connection.listen();
        this.connected = true;
    }

    async apiRequest<T>(method: string, params?: unknown): Promise<T> {
        if (!this.connected) {
            await this.connect();
        }
        if (!this.connection) {
            throw new Error("Connection not established");
        }

        const requestType = new RequestType<unknown, T, void>(method);
        if (!this.timing) {
            return this.connection.sendRequest(requestType, params);
        }

        const bytesSent = params === undefined ? 0 : byteLength(JSON.stringify(params));
        const start = performance.now();
        const result = await this.connection.sendRequest(requestType, params);
        const roundTripMs = performance.now() - start;
        this.timing.record({
            method,
            roundTripMs,
            bytesSent,
            bytesReceived: result === undefined || result === null ? 0 : byteLength(JSON.stringify(result)),
        });
        return result;
    }

    async apiRequestBinary(method: string, params?: unknown): Promise<Uint8Array | undefined> {
        const response = await this.apiRequest<{ data: string; } | null>(method, params);
        if (!response) return undefined;
        return base64ToBytes(response.data);
    }

    getTimingCollector(): TimingCollector | undefined {
        return this.timing;
    }

    async getTimingInfo(): Promise<TimingInfo> {
        if (!this.timing) {
            return disabledTimingInfo();
        }
        const local = this.timing.getInfo();
        if (!this.connected || !this.connection) {
            return local;
        }
        return combineTimingInfo(local, await this.fetchServerTiming());
    }

    async resetTimingInfo(): Promise<void> {
        if (!this.timing) return;
        this.timing.reset();
        if (this.connected && this.connection) {
            const requestType = new RequestType<unknown, void, void>("resetServerTiming");
            await this.connection.sendRequest(requestType, undefined);
        }
    }

    async close(): Promise<void> {
        if (this.connection) {
            this.connection.dispose();
            this.connection = undefined;
        }
        this.connected = false;
    }

    private async fetchServerTiming(): Promise<ServerTimingInfo> {
        if (!this.connection) {
            return disabledServerTimingInfo();
        }
        const requestType = new RequestType<unknown, ServerTimingInfo, void>("getServerTiming");
        return this.connection.sendRequest(requestType, undefined);
    }
}

function byteLength(s: string): number {
    return new TextEncoder().encode(s).length;
}

function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
`;
}
