import React, { useEffect, useReducer } from "react";
import * as actions from "./actions/index.js";
import {
  compilerVersionCollection,
  getCompilerApi,
  hasLoadedCompilerApi,
  type ScriptTarget,
} from "./compiler/index.js";
import { isTsgo, type TsgoPackageName } from "./compiler/tsgo/tsgoVersion.js";
import type { PrebuiltSourceFile } from "./types/index.js";
import type { CodeEditorTheme } from "./components/index.js";
import { appReducer, deriveEditorTheme } from "./reducers/index.js";
import { ApiLoadingState, type StoreState } from "./types/index.js";
import { sleep, StateSaver, UrlSaver } from "./utils/index.js";

const initialScriptTarget: ScriptTarget = 99 /* Latest */;
const stateSaver = new StateSaver();

console.log(
  "[ts-ast-viewer]: Inspect the ts, sourceFile, node, symbol, type, signature, program, and checker/typeChecker global variables here in the console.",
);

export interface AppContextValue {
  state: StoreState & { editorTheme: CodeEditorTheme };
  dispatch: React.Dispatch<actions.AllActions>;
}

export const AppContext = React.createContext<AppContextValue | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  // Guaranteed to have at least one property
  const urlFiles = new UrlSaver().getUrlFiles();

  const [state, dispatch] = useReducer(appReducer, {
    apiLoadingState: ApiLoadingState.Loading,
    currentFile: Object.keys(urlFiles)[0],
    files: urlFiles,
    options: {
      compilerPackageName: compilerVersionCollection[0].packageName,
      treeMode: stateSaver.get().treeMode,
      scriptTarget: initialScriptTarget,
      bindingEnabled: true,
      showFactoryCode: stateSaver.get().showFactoryCode,
      showInternals: stateSaver.get().showInternals,
      theme: stateSaver.get().theme,
    },
    compiler: undefined,
    editorTheme: deriveEditorTheme(stateSaver.get().theme),
  });

  globalThis.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    dispatch(actions.osThemeChange());
  });

  // tracks whether the resident tsgo wasm session is live, so it can be freed on switch-away
  const tsgoActiveRef = React.useRef(false);

  const value = { state, dispatch };

  useEffect(() => {
    const abortController = new AbortController();
    updateSourceFile(abortController.signal);
    return () => {
      abortController.abort();
    };

    async function updateSourceFile(abortSignal: AbortSignal) {
      const compilerPackageName = state.options.compilerPackageName;
      const changeLoadingState = !hasLoadedCompilerApi(compilerPackageName);
      try {
        if (changeLoadingState) {
          dispatch(actions.setApiLoadingState(ApiLoadingState.Loading));
        } else {
          await sleep(150); // debounce
        }

        if (abortSignal.aborted) {
          return;
        }

        const api = await getCompilerApi(compilerPackageName);
        if (abortSignal.aborted) {
          return;
        }

        if (isTsgo(compilerPackageName)) {
          // reuses one resident wasm session across edits (see tsgoCompiler.ts)
          const prebuilt = await buildTsgoSourceFile(compilerPackageName, state.files, state.currentFile);
          if (abortSignal.aborted) {
            return;
          }
          tsgoActiveRef.current = true;
          dispatch(actions.refreshSourceFile(api, prebuilt));
        } else {
          // switched away from tsgo — free the resident wasm session
          if (tsgoActiveRef.current) {
            tsgoActiveRef.current = false;
            import("./compiler/tsgo/tsgoCompiler.js").then((m) => m.disposeTsgoSession()).catch(() => {});
          }
          dispatch(actions.refreshSourceFile(api));
        }
        dispatch(actions.setApiLoadingState(ApiLoadingState.Loaded));
      } catch (err) {
        console.error(err);
        if (changeLoadingState) {
          dispatch(actions.setApiLoadingState(ApiLoadingState.Error));
        }
      }
    }
  }, [
    state.currentFile,
    state.files[state.currentFile],
    state.options.scriptTarget,
    state.options.compilerPackageName,
    state.options.bindingEnabled,
  ]);

  useEffect(() => {
    const savedState = stateSaver.get();
    savedState.treeMode = state.options.treeMode;
    savedState.showFactoryCode = state.options.showFactoryCode;
    savedState.showInternals = state.options.showInternals;
    savedState.theme = state.options.theme;
    stateSaver.set(savedState);
  }, [state.options.treeMode, state.options.showFactoryCode, state.options.showInternals, state.options.theme]);

  // keeps the console globals pointing at the selected node. Runs on selection/compiler
  // changes rather than every render, because tsgo's binding globals round-trip the wasm.
  useEffect(() => {
    const compiler = state.compiler;
    if (compiler == null || compiler.selectedNode == null) {
      return;
    }

    const windowAny = window as any;
    const selectedNode = compiler.selectedNode;
    windowAny.ts = compiler.api;
    windowAny.node = selectedNode;
    windowAny.selectedNode = selectedNode;
    windowAny.sourceFile = compiler.sourceFile;

    if (!state.options.bindingEnabled) {
      setBindingGlobals({});
      return;
    }

    if (compiler.asyncBinding != null) {
      const asyncBinding = compiler.asyncBinding;
      // tsgo's checker is out-of-process, so the node's type/symbol/signature only
      // arrive after a round trip — the checker and program proxies are usable now
      setBindingGlobals({ checker: asyncBinding.checker, program: asyncBinding.program });
      let cancelled = false;
      Promise.all([
        asyncBinding.getType(selectedNode),
        asyncBinding.getSymbol(selectedNode),
        asyncBinding.getSignature(selectedNode),
      ]).then(([type, symbol, signature]) => {
        if (cancelled) {
          return; // a newer selection owns the globals now
        }
        windowAny.type = type;
        windowAny.symbol = symbol;
        windowAny.signature = signature;
      }).catch((err) => console.error(err));
      return () => {
        cancelled = true;
      };
    }

    const bindingTools = compiler.bindingTools();
    setBindingGlobals({
      checker: bindingTools.typeChecker,
      program: bindingTools.program,
      type: tryGet(() => bindingTools.typeChecker.getTypeAtLocation(selectedNode)),
      symbol: tryGet(() => (selectedNode as any).symbol || bindingTools.typeChecker.getSymbolAtLocation(selectedNode)),
      signature: tryGet(() => bindingTools.typeChecker.getSignatureFromDeclaration(selectedNode as any)),
    });

    function tryGet<T>(getValue: () => T) {
      try {
        return getValue();
      } catch (_err) {
        return undefined;
      }
    }
  }, [state.compiler, state.options.bindingEnabled]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/** Set the binding-related console globals, clearing the ones not provided. */
function setBindingGlobals(
  globals: { checker?: unknown; program?: unknown; type?: unknown; symbol?: unknown; signature?: unknown },
) {
  const windowAny = window as any;
  windowAny.checker = globals.checker;
  windowAny.typeChecker = globals.checker;
  windowAny.program = globals.program;
  windowAny.type = globals.type;
  windowAny.symbol = globals.symbol;
  windowAny.signature = globals.signature;
}

// Builds a tsgo source file by booting the selected build's wasm (lazy-loaded here) and
// materializing the AST + async checker off the main static bundle.
async function buildTsgoSourceFile(
  packageName: TsgoPackageName,
  files: Record<string, string>,
  currentFile: string,
): Promise<PrebuiltSourceFile> {
  const { getTsgoSourceFile } = await import("./compiler/tsgo/tsgoCompiler.js");
  const result = await getTsgoSourceFile(packageName, { files, currentFile });
  return {
    sourceFile: result.sourceFile as any,
    bindingTools: () => {
      throw new Error("tsgo's checker is async — use asyncBinding.");
    },
    asyncBinding: result.asyncBinding,
  };
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context == null) {
    throw new Error("Context was undefined.");
  }
  return context;
}
