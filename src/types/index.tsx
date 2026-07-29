import type { CompilerApi, Node, Program, ScriptTarget, SourceFile, TypeChecker } from "../compiler/index.js";
import type { AnyCompilerPackageName } from "../compiler/ts7/ts7Version.js";

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
  // present for TypeScript 7.0, whose checker is async and out-of-process (wasm)
  asyncBinding?: AsyncBinding;
  // tears down the backing wasm session (TypeScript 7.0 only)
  dispose?: () => void;
}

export interface BindingTools {
  program: Program;
  typeChecker: TypeChecker;
}

/**
 * Async, out-of-process compiler binding for TypeScript 7.0. The Type/Symbol are
 * remote handle-based proxies: their scalar fields are readable synchronously once
 * fetched, while collections (properties, members, base types, …) are lazy async
 * calls on the proxy or the `checker`.
 */
export interface AsyncBinding {
  // deno-lint-ignore no-explicit-any
  checker: any;
  getType(node: Node): Promise<any | undefined>;
  getSymbol(node: Node): Promise<any | undefined>;
  typeToString(type: any): Promise<string | undefined>;
}

/** A source file built outside the reducer (async compilers), ready to store as-is. */
export interface PrebuiltSourceFile {
  sourceFile: SourceFile;
  bindingTools: () => BindingTools;
  asyncBinding?: AsyncBinding;
  dispose?: () => void;
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
