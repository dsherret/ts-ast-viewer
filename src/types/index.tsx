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
}

export interface BindingTools {
  program: Program;
  typeChecker: TypeChecker;
}

/** A source file built outside the reducer (async compilers), ready to store as-is. */
export interface PrebuiltSourceFile {
  sourceFile: SourceFile;
  bindingTools: () => BindingTools;
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
