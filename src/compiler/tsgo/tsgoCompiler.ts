// Adapts the tsgo API to a `CompilerApi` + a materialized `SourceFile` for the app.
// Producing the source file is async (it round-trips the wasm), so this runs in the
// AppContext effect, not the reducer, and the tree walks only via `forEachChild`
// (tsgo nodes have no `getChildren`). A single session stays resident across edits —
// each edit rewrites the changed files in the wasm's in-memory FS and re-parses. The
// enums and the client come from the selected build's vendored copy (see tsgoVendor.ts).
import { createTsgoApi, type TsgoApiHandle } from "./tsgoApi.ts";
import type { TsgoSourceFile, TsgoVendor } from "./tsgoVendor.ts";
import { getTsgoBuild, type TsgoBuild, type TsgoPackageName } from "./tsgoVersion.ts";
import type { AsyncBinding } from "../../types/index.js";
import type { CompilerApi } from "../CompilerApi.ts";

export interface TsgoSourceFileResult {
  api: CompilerApi;
  sourceFile: TsgoSourceFile;
  /** Async per-node checker access (the wasm checker is out-of-process). */
  asyncBinding: AsyncBinding;
}

export interface TsgoUpdateOptions {
  /** All files, keyed by absolute path (each file's extension sets its script kind). */
  files: Record<string, string>;
  /** The file to materialize and view (a key of `files`); imports resolve to the rest. */
  currentFile: string;
}

let residentSession: { build: TsgoBuild; session: Promise<TsgoSession> } | undefined;

/** Materialize the current file in the build's resident tsgo session, booting one (and
 * compiling the wasm) on first use. Later calls persist the session, so an edit is just
 * rewrite + re-parse. Only one build stays resident — switching frees the other's wasm. */
export async function getTsgoSourceFile(
  packageName: TsgoPackageName,
  options: TsgoUpdateOptions,
): Promise<TsgoSourceFileResult> {
  const build = getTsgoBuild(packageName);
  if (residentSession?.build !== build) {
    disposeTsgoSession();
    const session = createResidentSession(build);
    residentSession = { build, session };
    session.catch(() => disposeSession(session));
  }
  const resident = residentSession;
  try {
    return await (await resident.session).update(options);
  } catch (err) {
    disposeSession(resident.session); // a wedged session shouldn't break every later edit
    throw err;
  }
}

/** Tear down the resident tsgo session (e.g. to free its wasm memory). */
export function disposeTsgoSession(): void {
  const resident = residentSession;
  residentSession = undefined;
  resident?.session.then((s) => s.dispose()).catch(() => {});
}

/** Tear down `session`, unless a newer one has since taken its place. */
function disposeSession(session: Promise<TsgoSession>): void {
  if (residentSession?.session === session) {
    disposeTsgoSession();
  }
}

async function createResidentSession(build: TsgoBuild): Promise<TsgoSession> {
  const { getTsgoWasmModule } = await import("./loadTsgoWasm.ts");
  const [vendor, wasmModule] = await Promise.all([build.importVendor(), getTsgoWasmModule(build)]);
  return TsgoSession.create({ build, vendor, wasmModule });
}

export interface TsgoSessionOptions {
  build: TsgoBuild;
  /** The client vendored from the same commit as the build's wasm (see tsgoVendor.ts). */
  vendor: TsgoVendor;
  wasmModule: WebAssembly.Module;
}

/** A resident tsgo session backing the app's set of files. */
export class TsgoSession {
  private openFile: string | undefined;
  private files = new Map<string, string>();
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(
    private readonly handle: TsgoApiHandle,
    private readonly build: TsgoBuild,
    private readonly vendor: TsgoVendor,
  ) {
  }

  static async create(options: TsgoSessionOptions): Promise<TsgoSession> {
    const { build, vendor, wasmModule } = options;
    return new TsgoSession(await createTsgoApi({ vendor, wasmModule }), build, vendor);
  }

  /** Serialized so overlapping edits can't interleave updateSnapshot calls. */
  update(options: TsgoUpdateOptions): Promise<TsgoSourceFileResult> {
    const run = this.queue.then(() => this.doUpdate(options));
    this.queue = run.then(() => {}, () => {});
    return run;
  }

  dispose(): void {
    void this.handle.dispose();
  }

  private async doUpdate({ files, currentFile }: TsgoUpdateOptions): Promise<TsgoSourceFileResult> {
    // sync the wasm filesystem with the full file set so cross-file imports resolve
    const changed: string[] = [];
    const deleted: string[] = [];
    for (const [path, content] of Object.entries(files)) {
      if (this.files.get(path) !== content) {
        this.handle.setFile(path, content);
        changed.push(path); // new-or-modified; the server re-reads these
      }
    }
    for (const path of this.files.keys()) {
      if (!(path in files)) {
        this.handle.removeFile(path);
        deleted.push(path);
      }
    }
    this.files = new Map(Object.entries(files));

    // The open (viewed) file is held as an overlay snapshotted at open-time, so a
    // plain fileChanges signal is ignored for it. Closing it forces the reopen below
    // to re-read from the filesystem (close alone re-reads stale, reopen alone keeps
    // the old overlay — both steps are required, plus fileChanges.changed above).
    if (this.openFile != null) {
      await this.handle.api.updateSnapshot({ closeFiles: [this.openFile] });
    }
    this.openFile = currentFile;

    const snapshot = await this.handle.api.updateSnapshot({
      openFiles: [currentFile],
      fileChanges: { changed, deleted },
    });
    const project = await snapshot.getDefaultProjectForFile(currentFile);
    if (project == null) throw new Error(`tsgo returned no project for ${currentFile}`);
    const sourceFile = await project.program.getSourceFile(currentFile);
    if (sourceFile == null) throw new Error(`tsgo returned no source file for ${currentFile}`);

    const checker = project.checker;
    return {
      api: createTsgoCompilerApi(this.vendor, this.build),
      sourceFile,
      asyncBinding: {
        checker,
        program: project.program,
        getType: (node: any) => safe(() => checker.getTypeAtLocation(node)),
        getSymbol: (node: any) => safe(() => checker.getSymbolAtLocation(node)),
        getSignature: (node: any) => safe(() => checker.getSignatureFromDeclaration(node)),
        typeToString: (type: any) => safe(() => checker.typeToString(type)),
      },
    };
  }
}

/** Run an async checker call, swallowing errors (out-of-process, may reject). */
function safe<T>(fn: () => Promise<T>): Promise<T | undefined> {
  return Promise.resolve().then(fn).catch(() => undefined);
}

/** A `CompilerApi` backed by a build's vendored TSGO enums — enough to render the tree. */
export function createTsgoCompilerApi(vendor: TsgoVendor, build: TsgoBuild): CompilerApi {
  return {
    SyntaxKind: vendor.SyntaxKind,
    ModifierFlags: vendor.ModifierFlags,
    NodeFlags: vendor.NodeFlags,
    ScriptKind: vendor.ScriptKind,
    ScriptTarget: vendor.ScriptTarget,
    // enums used to decode Type/Symbol flags in the properties panel
    TypeFlags: vendor.TypeFlags,
    ObjectFlags: vendor.ObjectFlags,
    SymbolFlags: vendor.SymbolFlags,
    ElementFlags: vendor.ElementFlags,
    SignatureKind: vendor.SignatureKind,
    forEachChild: ((node: any, cbNode: any, cbNodes: any) => node.forEachChild(cbNode, cbNodes)) as any,
    version: build.version,
    // each build gets its own key, so caches derived from the api (ex. syntax kind
    // names, which differ between the release and the nightly) never mix
    tsAstViewer: {
      packageName: build.packageName as any,
      cachedSourceFiles: {},
    },
  } as unknown as CompilerApi;
}
