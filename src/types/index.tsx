import { CompilerApi, CompilerPackageNames, Node, Program, ScriptKind, ScriptTarget, SourceFile, TypeChecker } from "../compiler";

export interface StoreState {
  code: string;
  options: OptionsState;
  apiLoadingState: ApiLoadingState;
  compiler: CompilerState | undefined;
}

export interface CompilerState {
  packageName: CompilerPackageNames;
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

export interface OptionsState {
  compilerPackageName: CompilerPackageNames;
  treeMode: TreeMode;
  scriptTarget: ScriptTarget;
  scriptKind: ScriptKind;
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
