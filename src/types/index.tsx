import type { CompilerApi, Node, Program, ScriptTarget, SourceFile, TypeChecker } from "../compiler/index.js";
import type { AnyCompilerPackageName } from "../compiler/tsgo/tsgoVersion.js";

export interface StoreState {
  currentFile: string;
  files: Record<string, string>;
  options: OptionsState;
  apiLoadingState: ApiLoadingState;
  compiler: CompilerState | undefined;
}

export interface CompilerState {
  packageName: AnyCompilerPackageName;
  api: CompilerApi;
  sourceFile: SourceFile;
  selectedNode: Node;
  // this is deferred because binding may be disabled
  bindingTools: () => BindingTools;
  // present for tsgo, whose checker is async and out-of-process (wasm)
  asyncBinding?: AsyncBinding;
}

export interface BindingTools {
  program: Program;
  typeChecker: TypeChecker;
}

/**
 * Async, out-of-process compiler binding for tsgo. The Type/Symbol are
 * remote handle-based proxies: their scalar fields are readable synchronously once
 * fetched, while collections (properties, members, base types, …) are lazy async
 * calls on the proxy or the `checker`.
 */
export interface AsyncBinding {
  // deno-lint-ignore no-explicit-any
  checker: any;
  // deno-lint-ignore no-explicit-any
  program: any;
  getType(node: Node): Promise<any | undefined>;
  getSymbol(node: Node): Promise<any | undefined>;
  getSignature(node: Node): Promise<any | undefined>;
  typeToString(type: any): Promise<string | undefined>;
}

/** A source file built outside the reducer (async compilers), ready to store as-is. */
export interface PrebuiltSourceFile {
  sourceFile: SourceFile;
  bindingTools: () => BindingTools;
  asyncBinding?: AsyncBinding;
}

export interface OptionsState {
  compilerPackageName: AnyCompilerPackageName;
  treeMode: TreeMode;
  scriptTarget: ScriptTarget;
  bindingEnabled: boolean;
  showFactoryCode: boolean;
  showInternals: boolean;
  theme: Theme;
}

export enum ApiLoadingState {
  Loading,
  Loaded,
  Error,
}

export enum TreeMode {
  forEachChild,
  getChildren,
}

export enum Theme {
  OS = "os",
  Dark = "dark",
  Light = "light",
}
