// Adapts the tsgo API to a `CompilerApi` + a materialized `SourceFile` for the app.
// Booting the wasm is async (it instantiates the module), so this runs in the AppContext
// effect rather than the reducer — but everything after that is synchronous, including
// the checker, because the wasm is a reactor driven by plain function calls (see
// tsgoWasmSession.ts). The tree walks only via `forEachChild` (tsgo nodes have no
// `getChildren`). A single session stays resident across edits — each edit rewrites the
// changed files in the reactor's in-memory FS and re-parses. The enums and the client
// come from the selected build's vendored copy (see tsgoVendor.ts).
import type { TsgoSourceFile, TsgoVendor } from "./tsgoVendor.ts";
import { getTsgoBuild, type TsgoBuild, type TsgoPackageName } from "./tsgoVersion.ts";
import type { TsgoWasmSession } from "./tsgoWasmSession.ts";
import type { BindingTools } from "../../types/index.js";
import type { CompilerApi } from "../CompilerApi.ts";

export interface TsgoSourceFileResult {
  api: CompilerApi;
  sourceFile: TsgoSourceFile;
  /** The program and checker for the current snapshot — synchronous, like classic TS. */
  bindingTools: BindingTools;
}

export interface TsgoUpdateOptions {
  /** All files, keyed by absolute path (each file's extension sets its script kind). */
  files: Record<string, string>;
  /** The file to materialize and view (a key of `files`); imports resolve to the rest. */
  currentFile: string;
}

let residentSession: { build: TsgoBuild; session: Promise<TsgoSession> } | undefined;

/** Materialize the current file in the build's resident tsgo session, booting one (and
 * instantiating the wasm) on first use. Later calls persist the session, so an edit is
 * just rewrite + re-parse. Only one build stays resident — switching frees the other's
 * wasm. */
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
    return (await resident.session).update(options);
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
  const { createTsgoWasmSession } = await import("./tsgoWasmSession.ts");
  const [vendor, wasmModule] = await Promise.all([build.importVendor(), getTsgoWasmModule(build)]);
  // the one await that has to exist: V8 refuses synchronous instantiation of a module
  // this size on the main thread (see tsgoWasmSession.ts)
  const wasm = await createTsgoWasmSession({ wasmModule, cwd: "/" });
  return new TsgoSession(wasm, build, vendor);
}

/** A resident tsgo session backing the app's set of files. */
export class TsgoSession {
  private openFile: string | undefined;
  private files = new Map<string, string>();
  private readonly api: InstanceType<TsgoVendor["API"]>;

  constructor(
    private readonly wasm: TsgoWasmSession,
    private readonly build: TsgoBuild,
    private readonly vendor: TsgoVendor,
  ) {
    this.api = new vendor.API({ session: wasm } as never);
  }

  dispose(): void {
    this.wasm.close();
  }

  /** Sync the reactor's filesystem with the app's files and materialize the current one.
   * Synchronous throughout — no queue is needed, because a call can't interleave. */
  update({ files, currentFile }: TsgoUpdateOptions): TsgoSourceFileResult {
    const changed: string[] = [];
    const deleted: string[] = [];
    for (const [path, content] of Object.entries(files)) {
      if (this.files.get(path) !== content) {
        this.wasm.setFile(path, content);
        changed.push(path); // new-or-modified; the server re-reads these
      }
    }
    for (const path of this.files.keys()) {
      if (!(path in files)) {
        this.wasm.removeFile(path);
        deleted.push(path);
      }
    }
    this.files = new Map(Object.entries(files));

    // The open (viewed) file is held as an overlay snapshotted at open-time, so a
    // plain fileChanges signal is ignored for it. Closing it forces the reopen below
    // to re-read from the filesystem (close alone re-reads stale, reopen alone keeps
    // the old overlay — both steps are required, plus fileChanges.changed above).
    if (this.openFile != null) {
      this.api.updateSnapshot({ closeFiles: [this.openFile] });
    }
    this.openFile = currentFile;

    const snapshot = this.api.updateSnapshot({
      openFiles: [currentFile],
      fileChanges: { changed, deleted },
    });
    const project = snapshot.getDefaultProjectForFile(currentFile);
    if (project == null) throw new Error(`tsgo returned no project for ${currentFile}`);
    const sourceFile = project.program.getSourceFile(currentFile);
    if (sourceFile == null) throw new Error(`tsgo returned no source file for ${currentFile}`);

    return {
      api: createTsgoCompilerApi(this.vendor, this.build),
      sourceFile,
      bindingTools: { program: project.program as never, typeChecker: project.checker as never },
    };
  }
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
