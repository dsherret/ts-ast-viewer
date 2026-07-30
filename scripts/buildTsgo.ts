// Builds a tsgo WebAssembly reactor per selectable TypeScript 7.0+ version
// (public/tsgo-<id>.wasm, see scripts/tsgoReactor/main.go) and vendors each one's
// matching JS client (src/compiler/tsgo/vendor/<id>/native-preview) from the single
// typescript-go commit it was built from, so a client and its reactor can't drift out of
// protocol sync.
// Two builds: the latest `main` (the nightly) and the most recent stable release. Needs
// Go + git on PATH; `--skip-wasm` re-vendors only the JS clients (fast, no Go) and
// `--wasm-only=<id>` builds just one of the wasms (both clients are always vendored,
// because the app imports both).
import $ from "@david/dax";
import * as semver from "@std/semver";
import * as path from "node:path";

const REPO = "https://github.com/microsoft/typescript-go.git";

const root = path.resolve(import.meta.dirname!, "..");
const wasmOutDir = path.join(root, "public");
const vendorRootDir = path.join(root, "src/compiler/tsgo/vendor");
const workDir = path.join(root, ".tsgo-build");
const skipWasm = Deno.args.includes("--skip-wasm");
const wasmOnly = Deno.args.map((arg) => /^--wasm-only=(.+)$/.exec(arg)?.[1]).find((id) => id != null);

interface BuildResult {
  id: string;
  ref: string;
  commit: string;
  commitDate: string;
  /** The version the app displays: the npm release for a tag, else the commit date. */
  version: string;
}

await $`git --version`.quiet();
if (!skipWasm) await $`go version`.quiet();

// The typescript-go refs each selectable version is built from. `nightly` tracks main;
// `stable` is the most recent release, matched to its npm package version (see
// getLatestReleaseRef). Override either to pin a build.
const refs = {
  nightly: Deno.env.get("TSGO_NIGHTLY_REF") ?? "main",
  stable: Deno.env.get("TSGO_STABLE_REF") ?? await getLatestReleaseRef(),
};

if (wasmOnly != null && !(wasmOnly in refs)) {
  throw new Error(`Unknown --wasm-only build: ${wasmOnly}. Expected one of ${Object.keys(refs).join(", ")}.`);
}

// vendored clients are always rebuilt as a set, so nothing from an older layout survives
await $.path(vendorRootDir).remove({ recursive: true }).catch(() => {});

const builds: BuildResult[] = [];
for (const [id, ref] of Object.entries(refs)) {
  builds.push(await buildVersion(id, ref));
}
await writeBuildInfo(builds);

/** Vendor one version's client and (unless skipped) build its wasm. */
async function buildVersion(id: string, ref: string): Promise<BuildResult> {
  const { repoDir, commit, commitDate } = await checkoutTsgo(ref);
  await vendorClient(id, repoDir, commit);
  if (!skipWasm && (wasmOnly == null || wasmOnly === id)) {
    await buildWasm(id, repoDir);
  }
  return { id, ref, commit, commitDate, version: getVersionFromRef(ref) ?? commitDate };
}

/**
 * The typescript-go ref of the most recent stable TypeScript 7.0+ release. Every
 * `@typescript/native-preview` npm release is tagged in typescript-go as
 * `typescript/vX.Y.Z`, so the highest such tag is both the newest release the app can
 * build and the npm version to label it with.
 */
async function getLatestReleaseRef(): Promise<string> {
  const output = await $`git ls-remote --tags ${REPO}`.text();
  const versions: semver.SemVer[] = [];
  for (const line of output.split("\n")) {
    const tagged = /refs\/tags\/typescript\/v(\S+)$/.exec(line.trim())?.[1];
    const version = tagged == null ? undefined : semver.tryParse(tagged);
    if (version != null && (version.prerelease?.length ?? 0) === 0) {
      versions.push(version);
    }
  }
  versions.sort(semver.compare);
  const latest = versions.at(-1);
  if (latest == null) {
    throw new Error("Found no `typescript/vX.Y.Z` release tag in typescript-go.");
  }
  return `typescript/v${semver.format(latest)}`;
}

/** The release version a ref names (`typescript/v7.0.2` → `7.0.2`), if it names one. */
function getVersionFromRef(ref: string): string | undefined {
  return /\/v(\d+\.\d+\.\d+)$/.exec(ref)?.[1];
}

/** Sparse-clone typescript-go at `ref` and return the resolved commit. */
async function checkoutTsgo(ref: string): Promise<{ repoDir: string; commit: string; commitDate: string }> {
  const repoDir = path.join(workDir, "typescript-go");
  if (!(await $.path(repoDir).exists())) {
    $.logStep("Cloning", "typescript-go");
    await $`git clone --filter=blob:none --no-checkout ${REPO} ${repoDir}`;
    await $`git sparse-checkout init --no-cone`.cwd(repoDir);
    // everything except the huge conformance fixtures
    await $.path(path.join(repoDir, ".git/info/sparse-checkout"))
      .writeText("/*\n!/internal/testdata/\n!/testdata/\n!/_submodules/\n");
  }
  await $`git fetch --depth 1 origin ${ref}`.cwd(repoDir).quiet();
  // forced, because building a previous ref left the reactor package in the tree
  await $`git checkout -f FETCH_HEAD`.cwd(repoDir);
  const commit = (await $`git rev-parse HEAD`.cwd(repoDir).text()).trim();
  // the commit's date (yyyy-mm-dd) is what the app shows as the nightly's version
  const commitDate = (await $`git log -1 --format=%cs`.cwd(repoDir).text()).trim();
  $.log(`typescript-go ${ref} → ${commit.slice(0, 8)} (${commitDate})`);
  return { repoDir, commit, commitDate };
}

/** Record which typescript-go commit each build came from, for the app to display. */
async function writeBuildInfo(builds: BuildResult[]) {
  const outPath = path.join(root, "src/compiler/tsgo/tsgoBuildInfo.generated.ts");
  const entries = builds.map((result) => {
    const info = { ref: result.ref, commit: result.commit, commitDate: result.commitDate, version: result.version };
    return `  ${result.id}: ${JSON.stringify(info)},\n`;
  });
  await $.path(outPath).writeText(
    `// Generated by scripts/buildTsgo.ts — do not edit.\n` +
      `export const TSGO_BUILDS = {\n${entries.join("")}} as const;\n`,
  );
  $.logStep("Wrote", path.relative(root, outPath));
}

/**
 * Vendor one build's native-preview JS client (`_packages/native-preview/src`) into the
 * repo, rewriting the handful of Node-only imports so it runs in the browser:
 *  - `#enums/x`      → the relative `.enum.ts` (a real TS enum: values + types),
 *  - `#getExePath`   → a stub (only the unused spawn path needs it),
 *  - `node:buffer`   → dropped (wtf8's one use becomes `Uint8Array.includes`),
 *  - the sync transport `client.ts` → our wasm-reactor version (see below).
 *
 * The *sync* client is the one vendored: upstream generates `api/sync` from `api/async`
 * and it is otherwise the same API, so driving the in-process reactor through it is what
 * makes the app's checker synchronous. The async client, the subprocess sync channel and
 * the Node client are skipped entirely.
 */
async function vendorClient(id: string, repoDir: string, commit: string) {
  const srcRoot = path.join(repoDir, "_packages/native-preview/src");
  const vendorOutDir = path.join(vendorRootDir, id, "native-preview");
  $.logStep("Vendoring", `native-preview client → ${path.relative(root, vendorOutDir)}`);
  await $.path(vendorOutDir).ensureDir();

  const enumsDir = path.join(vendorOutDir, "enums");
  for await (const entry of walkTs(srcRoot)) {
    const rel = path.relative(srcRoot, entry).replaceAll("\\", "/");
    if (rel.startsWith("api/async/") || rel === "api/syncChannel.ts") continue; // unused here
    if (rel.startsWith("enums/") && !rel.endsWith(".enum.ts")) continue; // keep only the real enums
    if (rel === "api/sync/client.ts") continue; // replaced with our reactor transport below

    const outPath = path.join(vendorOutDir, rel);
    await $.path(path.dirname(outPath)).ensureDir();
    await $.path(outPath).writeText(rewrite(rel, await $.path(entry).readText(), path.dirname(outPath), enumsDir));
  }

  await $.path(path.join(vendorOutDir, "api/sync/client.ts")).writeText(wasmClientSource());
  await $.path(path.join(vendorOutDir, "GENERATED.md")).writeText(attribution(commit));
  await $.path(path.join(vendorOutDir, "..", "tsgo.commit")).writeText(commit + "\n");
  await $.path(path.join(vendorOutDir, "..", "mod.ts")).writeText(vendorModSource());
}

/**
 * The one entry point the app loads a vendored client through (see tsgoVendor.ts). Each
 * build has its own copy of these modules, so keeping the surface in one file is what
 * lets the app swap between them with a single dynamic import.
 */
function vendorModSource() {
  return `// Generated by scripts/buildTsgo.ts — the vendored client surface the app uses.
export { API } from "./native-preview/api/sync/api.ts";
export {
  ModifierFlags,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from "./native-preview/ast/index.ts";
export type { SourceFile } from "./native-preview/ast/index.ts";
export { ElementFlags } from "./native-preview/enums/elementFlags.enum.ts";
export { ObjectFlags } from "./native-preview/enums/objectFlags.enum.ts";
export { SignatureKind } from "./native-preview/enums/signatureKind.enum.ts";
export { SymbolFlags } from "./native-preview/enums/symbolFlags.enum.ts";
export { TypeFlags } from "./native-preview/enums/typeFlags.enum.ts";
`;
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
    // let the API carry an injected reactor session (see client.ts)
    text = text.replace(
      `import type { FileSystem } from "./fs.ts";`,
      `import type { FileSystem } from "./fs.ts";\nimport type { TsgoWasmSession } from "../../../../tsgoWasmSession.ts";`,
    ).replace(
      `export interface ClientSpawnOptions {`,
      `export interface ClientSpawnOptions {\n    /** Injected in-process wasm reactor session (browser transport). */\n    session?: TsgoWasmSession;`,
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

async function buildWasm(id: string, repoDir: string) {
  await installReactor(repoDir);
  $.logStep("Building", `tsgo-${id}.wasm (GOOS=wasip1 GOARCH=wasm) — this takes a few minutes`);
  await $.path(wasmOutDir).ensureDir();
  const outFile = path.join(wasmOutDir, `tsgo-${id}.wasm`);
  // -buildmode=c-shared makes a reactor: `_initialize` plus the //go:wasmexport
  // entry points, instead of a `_start` that runs a server loop and never returns.
  await $`go build -buildmode=c-shared -o ${outFile} ./cmd/tsgo-wasm`
    .cwd(repoDir)
    .env({ GOOS: "wasip1", GOARCH: "wasm", GOTOOLCHAIN: "auto" });
  const size = (await $.path(outFile).stat())!.size;
  $.log(`Wrote ${outFile} (${(size / 1024 / 1024).toFixed(0)} MB)`);
}

/**
 * Copy the reactor into the checkout as `cmd/tsgo-wasm`.
 *
 * This is the whole of the local change to typescript-go: one added package, nothing
 * modified. That is deliberate — a patch against existing code goes stale as soon as
 * upstream touches the lines around it, whereas an added package that only calls
 * exported API keeps compiling across refs, and fails the Go build naming the symbol
 * when it doesn't. It is what lets the nightly track `main` unattended.
 */
async function installReactor(repoDir: string) {
  const source = path.join(root, "scripts/tsgoReactor/main.go");
  const target = path.join(repoDir, "cmd/tsgo-wasm/main.go");
  await $.path(path.dirname(target)).ensureDir();
  await $.path(source).copyFile(target);
  $.logStep("Installed", "cmd/tsgo-wasm (reactor)");
}

function attribution(commit: string) {
  return `# Vendored from microsoft/typescript-go

These files are generated by \`deno task buildTsgo\` from
\`_packages/native-preview/src\` at commit ${commit} (Apache-2.0, © Microsoft).

Do not edit by hand — re-run the task to update. The only local changes are the
import rewrites documented in scripts/buildTsgo.ts (Node-only imports made
browser-safe) and api/sync/client.ts, which is our in-process reactor transport.
`;
}

// Our replacement for native-preview's sync client (which spawns a tsgo child process
// and talks to it over libsyncrpc). Here the compiler is a wasm reactor running
// in-process, and the app injects a session that drives it with plain function calls
// (see tsgoWasmSession.ts) — which is what makes this client, and so the checker,
// synchronous. Source files reach the compiler through the reactor's own in-memory
// filesystem, so no FS callbacks are registered. The public surface matches the pieces
// api/sync/api.ts depends on: apiRequest, apiRequestBinary, close, and timing.
function wasmClientSource() {
  // one level deeper than options.ts: this file is in api/sync/, that one in api/
  return `// Generated by scripts/buildTsgo.ts — in-process wasm reactor transport (not upstream).
import type { TsgoWasmSession } from "../../../../../tsgoWasmSession.ts";
import type {
    ClientOptions,
    ClientSocketOptions,
    ClientSpawnOptions,
} from "../options.ts";
import {
    combineTimingInfo,
    disabledServerTimingInfo,
    type ServerTimingInfo,
    TimingCollector,
    type TimingInfo,
} from "../timing.ts";

export type { ClientOptions, ClientSocketOptions, ClientSpawnOptions };

/**
 * Talks to a tsgo reactor wasm running in this thread, through the session supplied
 * as \\\`options.session\\\`. Every method is synchronous: a request is a single call into
 * the module, which runs it to completion before returning.
 */
export class Client {
    private session: TsgoWasmSession;
    private encoder = new TextEncoder();
    private timing: TimingCollector | undefined;

    constructor(options: ClientOptions) {
        const session = (options as ClientSpawnOptions).session;
        if (!session) {
            throw new Error(
                "No tsgo wasm session was injected (options.session). "
                    + "The browser build cannot spawn a tsgo process.",
            );
        }
        this.session = session;
        if ((options as ClientSpawnOptions).collectTiming) {
            this.timing = new TimingCollector();
        }
    }

    apiRequest<T>(method: string, params?: unknown): T {
        const start = performance.now();
        const result = this.session.requestSync(method, JSON.stringify(params));
        this.recordTiming(method, start);
        return result.length ? JSON.parse(result) as T : undefined as unknown as T;
    }

    apiRequestBinary(method: string, params?: unknown): Uint8Array | undefined {
        const start = performance.now();
        const result = this.session.requestBinarySync(method, this.encoder.encode(JSON.stringify(params)));
        this.recordTiming(method, start);
        return result.length === 0 ? undefined : result;
    }

    getTimingCollector(): TimingCollector | undefined {
        return this.timing;
    }

    getTimingInfo(): TimingInfo {
        if (!this.timing) {
            return { client: undefined, server: disabledServerTimingInfo() } as unknown as TimingInfo;
        }
        // requestSync bypasses recordTiming, so this query doesn't pollute the collector
        const result = this.session.requestSync("getServerTiming", "");
        return combineTimingInfo(this.timing.getInfo(), JSON.parse(result) as ServerTimingInfo);
    }

    resetTimingInfo(): void {
        if (!this.timing) return;
        this.timing.reset();
        this.session.requestSync("resetServerTiming", "");
    }

    close(): void {
        this.session.close();
    }

    private recordTiming(method: string, start: number): void {
        if (!this.timing) return;
        this.timing.record({
            method,
            roundTripMs: performance.now() - start,
            bytesSent: this.session.lastBytesSent,
            bytesReceived: this.session.lastBytesReceived,
        });
    }
}
`;
}
