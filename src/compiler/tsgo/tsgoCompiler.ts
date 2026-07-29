// Adapts the tsgo API to a `CompilerApi` + a materialized `SourceFile` for the app.
// Producing the source file is async (it round-trips the wasm), so this runs in the
// AppContext effect, not the reducer, and the tree walks only via `forEachChild`
// (tsgo nodes have no `getChildren`). A single session stays resident across edits —
// each edit rewrites the changed files in the wasm's in-memory FS and re-parses.
import {
  ModifierFlags,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
  type SourceFile as TsgoSourceFile,
  SyntaxKind,
} from "./vendor/native-preview/ast/index.ts";
import { ElementFlags } from "./vendor/native-preview/enums/elementFlags.enum.ts";
import { ObjectFlags } from "./vendor/native-preview/enums/objectFlags.enum.ts";
import { SignatureKind } from "./vendor/native-preview/enums/signatureKind.enum.ts";
import { SymbolFlags } from "./vendor/native-preview/enums/symbolFlags.enum.ts";
import { TypeFlags } from "./vendor/native-preview/enums/typeFlags.enum.ts";
import { createTsgoApi, type TsgoApiHandle } from "./tsgoApi.ts";
import { TSGO_PACKAGE_NAME } from "./tsgoVersion.ts";
import type { AsyncBinding } from "../../types/index.js";
import type { CompilerApi } from "../CompilerApi.ts";

export { TSGO_PACKAGE_NAME };

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
  version: string;
}

let residentSession: Promise<TsgoSession> | undefined;

/** Materialize the current file in the resident tsgo session, booting one (and compiling
 * the wasm) on first use. Later calls persist the session, so an edit is just rewrite + re-parse. */
export async function getTsgoSourceFile(options: TsgoUpdateOptions): Promise<TsgoSourceFileResult> {
  if (residentSession == null) {
    residentSession = createResidentSession();
    residentSession.catch(() => residentSession = undefined);
  }
  try {
    return await (await residentSession).update(options);
  } catch (err) {
    disposeTsgoSession(); // a wedged session shouldn't break every later edit
    throw err;
  }
}

/** Tear down the resident tsgo session (e.g. to free its wasm memory). */
export function disposeTsgoSession(): void {
  const session = residentSession;
  residentSession = undefined;
  session?.then((s) => s.dispose()).catch(() => {});
}

async function createResidentSession(): Promise<TsgoSession> {
  const { getTsgoWasmModule } = await import("./loadTsgoWasm.ts");
  return TsgoSession.create(await getTsgoWasmModule());
}

/** A resident tsgo session backing the app's set of files. */
export class TsgoSession {
  private openFile: string | undefined;
  private files = new Map<string, string>();
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(private readonly handle: TsgoApiHandle) {
  }

  static async create(wasmModule: WebAssembly.Module): Promise<TsgoSession> {
    return new TsgoSession(await createTsgoApi({ wasmModule }));
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

  private async doUpdate({ files, currentFile, version }: TsgoUpdateOptions): Promise<TsgoSourceFileResult> {
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
      api: createTsgoCompilerApi(version),
      sourceFile,
      asyncBinding: {
        checker,
        getType: (node: any) => safe(() => checker.getTypeAtLocation(node)),
        getSymbol: (node: any) => safe(() => checker.getSymbolAtLocation(node)),
        typeToString: (type: any) => safe(() => checker.typeToString(type)),
      },
    };
  }
}

/** Run an async checker call, swallowing errors (out-of-process, may reject). */
function safe<T>(fn: () => Promise<T>): Promise<T | undefined> {
  return Promise.resolve().then(fn).catch(() => undefined);
}

/** A `CompilerApi` backed by the vendored TSGO enums — enough to render the tree. */
export function createTsgoCompilerApi(version: string): CompilerApi {
  return {
    SyntaxKind,
    ModifierFlags,
    NodeFlags,
    ScriptKind,
    ScriptTarget,
    // enums used to decode Type/Symbol flags in the properties panel
    TypeFlags,
    ObjectFlags,
    SymbolFlags,
    ElementFlags,
    SignatureKind,
    forEachChild: ((node: any, cbNode: any, cbNodes: any) => node.forEachChild(cbNode, cbNodes)) as any,
    version,
    tsAstViewer: {
      packageName: TSGO_PACKAGE_NAME as any,
      cachedSourceFiles: {},
    },
  } as unknown as CompilerApi;
}
