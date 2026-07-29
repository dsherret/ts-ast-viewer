// Adapts the TypeScript 7.0 (tsgo) API to the shape the rest of the app expects
// from a compiler version: a `CompilerApi` (mainly `SyntaxKind` + enums for the
// tree/properties UI) and a materialized, synchronously-walkable `SourceFile`.
//
// The important difference from classic TypeScript is that producing the source
// file is ASYNC (it round-trips the wasm), so this must run in the AppContext
// effect rather than the reducer. Once materialized, the node tree walks
// synchronously — but only via `forEachChild` (TS7 nodes have no `getChildren`).
//
// A single tsgo session is kept resident and reused across edits: each edit only
// rewrites the one file in the wasm's in-memory filesystem and re-parses it (the
// already-parsed lib.d.ts is retained), instead of re-booting the whole wasm.
import {
  ModifierFlags,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
  type SourceFile as Ts7SourceFile,
  SyntaxKind,
} from "./vendor/native-preview/ast/index.ts";
import { ElementFlags } from "./vendor/native-preview/enums/elementFlags.enum.ts";
import { ObjectFlags } from "./vendor/native-preview/enums/objectFlags.enum.ts";
import { SignatureKind } from "./vendor/native-preview/enums/signatureKind.enum.ts";
import { SymbolFlags } from "./vendor/native-preview/enums/symbolFlags.enum.ts";
import { TypeFlags } from "./vendor/native-preview/enums/typeFlags.enum.ts";
import { createTsgoApi, type TsgoApiHandle } from "./tsgoApi.ts";
import { TS7_PACKAGE_NAME } from "./ts7Version.ts";
import type { AsyncBinding } from "../../types/index.js";
import type { CompilerApi } from "../CompilerApi.ts";

export { TS7_PACKAGE_NAME };

export interface Ts7SourceFileResult {
  api: CompilerApi;
  sourceFile: Ts7SourceFile;
  /** Async per-node checker access (the wasm checker is out-of-process). */
  asyncBinding: AsyncBinding;
}

export interface Ts7UpdateOptions {
  code: string;
  scriptKind: number;
  version: string;
}

let residentSession: Promise<Ts7Session> | undefined;

/**
 * Materialize the source file for `code` in the resident tsgo session, booting one
 * (and compiling the wasm) on first use. The session persists across calls, so a
 * subsequent edit is just a file rewrite + re-parse.
 */
export async function getTs7SourceFile(options: Ts7UpdateOptions): Promise<Ts7SourceFileResult> {
  if (residentSession == null) {
    residentSession = createResidentSession();
    residentSession.catch(() => residentSession = undefined);
  }
  try {
    return await (await residentSession).update(options);
  } catch (err) {
    disposeTs7Session(); // a wedged session shouldn't break every later edit
    throw err;
  }
}

/** Tear down the resident tsgo session (e.g. to free its wasm memory). */
export function disposeTs7Session(): void {
  const session = residentSession;
  residentSession = undefined;
  session?.then((s) => s.dispose()).catch(() => {});
}

async function createResidentSession(): Promise<Ts7Session> {
  const { getTsgoWasmModule } = await import("./loadTsgoWasm.ts");
  return Ts7Session.create(await getTsgoWasmModule());
}

/** A resident tsgo session backing a single edited file. */
export class Ts7Session {
  #handle: TsgoApiHandle;
  #openFile: string | undefined;
  #queue: Promise<unknown> = Promise.resolve();

  private constructor(handle: TsgoApiHandle) {
    this.#handle = handle;
  }

  static async create(wasmModule: WebAssembly.Module): Promise<Ts7Session> {
    return new Ts7Session(await createTsgoApi({ wasmModule }));
  }

  /** Serialized so overlapping edits can't interleave updateSnapshot calls. */
  update(options: Ts7UpdateOptions): Promise<Ts7SourceFileResult> {
    const run = this.#queue.then(() => this.#doUpdate(options));
    this.#queue = run.then(() => {}, () => {});
    return run;
  }

  dispose(): void {
    void this.#handle.dispose();
  }

  async #doUpdate(options: Ts7UpdateOptions): Promise<Ts7SourceFileResult> {
    const fileName = `/ts-ast-viewer${extensionForScriptKind(options.scriptKind)}`;
    this.#handle.setFile(fileName, options.code);
    // An open file is held as an overlay snapshotted at open-time, so a plain
    // fileChanges signal is ignored. To re-read the rewritten file we must close
    // it, then reopen WITH fileChanges.changed (close alone re-reads stale, and
    // reopen alone keeps the old overlay — both steps are required).
    if (this.#openFile != null) {
      await this.#handle.api.updateSnapshot({ closeFiles: [this.#openFile] });
    }
    this.#openFile = fileName;

    const snapshot = await this.#handle.api.updateSnapshot({
      openFiles: [fileName],
      fileChanges: { changed: [fileName] },
    });
    const project = await snapshot.getDefaultProjectForFile(fileName);
    if (project == null) throw new Error(`tsgo returned no project for ${fileName}`);
    const sourceFile = await project.program.getSourceFile(fileName);
    if (sourceFile == null) throw new Error(`tsgo returned no source file for ${fileName}`);

    const checker = project.checker;
    return {
      api: createTs7CompilerApi(options.version),
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

/** A `CompilerApi` backed by the vendored TS7 enums — enough to render the tree. */
export function createTs7CompilerApi(version: string): CompilerApi {
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
      packageName: TS7_PACKAGE_NAME as any,
      cachedSourceFiles: {},
    },
  } as unknown as CompilerApi;
}

function extensionForScriptKind(scriptKind: number): string {
  switch (scriptKind) {
    case ScriptKind.TS:
      return ".ts";
    case ScriptKind.TSX:
      return ".tsx";
    case ScriptKind.JS:
      return ".js";
    case ScriptKind.JSX:
      return ".jsx";
    case ScriptKind.JSON:
      return ".json";
    default:
      return ".ts";
  }
}
