import React, { useEffect, useReducer } from "react";
import * as actions from "./actions/index.js";
import {
  compilerVersionCollection,
  getCompilerApi,
  hasLoadedCompilerApi,
  type ScriptKind,
  type ScriptTarget,
} from "./compiler/index.js";
import type { CodeEditorTheme } from "./components/index.js";
import { appReducer, deriveEditorTheme } from "./reducers/index.js";
import { ApiLoadingState, type StoreState } from "./types/index.js";
import { sleep, StateSaver, UrlSaver } from "./utils/index.js";

const initialScriptTarget: ScriptTarget = 99 /* Latest */;
const initialScriptKind: ScriptKind = 4 /* TSX */;
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
  const [state, dispatch] = useReducer(appReducer, {
    apiLoadingState: ApiLoadingState.Loading,
    code: new UrlSaver().getUrlCode(),
    options: {
      compilerPackageName: compilerVersionCollection[0].packageName,
      treeMode: stateSaver.get().treeMode,
      scriptTarget: initialScriptTarget,
      scriptKind: initialScriptKind,
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

        dispatch(actions.refreshSourceFile(api));
        dispatch(actions.setApiLoadingState(ApiLoadingState.Loaded));
      } catch (err) {
        console.error(err);
        if (changeLoadingState) {
          dispatch(actions.setApiLoadingState(ApiLoadingState.Error));
        }
      }
    }
  }, [
    state.code,
    state.options.scriptKind,
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

  useEffect(() => {
    if (state.compiler == null || state.compiler.selectedNode == null) {
      return;
    }

    const windowAny = window as any;
    const selectedNode = state.compiler.selectedNode;
    windowAny.ts = state.compiler.api;
    windowAny.node = selectedNode;
    windowAny.selectedNode = selectedNode;
    windowAny.sourceFile = state.compiler.sourceFile;

    if (state.options.bindingEnabled) {
      const bindingTools = state.compiler.bindingTools();
      windowAny.checker = bindingTools.typeChecker;
      windowAny.typeChecker = bindingTools.typeChecker;
      windowAny.program = bindingTools.program;
      windowAny.type = tryGet(() => bindingTools.typeChecker.getTypeAtLocation(selectedNode));
      windowAny.symbol = tryGet(() =>
        (selectedNode as any).symbol || bindingTools.typeChecker.getSymbolAtLocation(selectedNode)
      );
      windowAny.signature = tryGet(() => bindingTools.typeChecker.getSignatureFromDeclaration(selectedNode as any));
    } else {
      windowAny.checker = undefined;
      windowAny.typeChecker = undefined;
      windowAny.program = undefined;
      windowAny.type = undefined;
      windowAny.symbol = undefined;
      windowAny.signature = undefined;
    }

    function tryGet<T>(getValue: () => T) {
      try {
        return getValue();
      } catch (_err) {
        return undefined;
      }
    }
  });

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context == null) {
    throw new Error("Context was undefined.");
  }
  return context;
}
