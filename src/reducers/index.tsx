import { AllActions } from "../actions/index.js";
import { CompilerApi, CompilerPackageNames, convertOptions, createSourceFile } from "../compiler/index.js";
import { CodeEditorTheme } from "../components/index.js";
import { actions as actionNames } from "./../constants/index.js";
import { OptionsState, StoreState } from "../types/index.js";
import { Theme } from "../types/index.js";
import { UrlSaver } from "../utils/index.js";

const urlSaver = new UrlSaver();

export function appReducer(state: StoreState & { editorTheme: CodeEditorTheme }, action: AllActions): StoreState & { editorTheme: CodeEditorTheme } {
  switch (action.type) {
    case actionNames.SET_SELECTED_NODE: {
      if (state.compiler == null) {
        return state;
      }

      return {
        ...state,
        compiler: {
          ...state.compiler,
          selectedNode: action.node,
        },
      };
    }
    case actionNames.SET_API_LOADING_STATE: {
      return {
        ...state,
        apiLoadingState: action.loadingState,
      };
    }
    case actionNames.REFRESH_SOURCEFILE: {
      const newState = {
        ...state,
        options: convertOptions(state.compiler == null ? undefined : state.compiler.api, action.api, state.options),
      };
      fillNewSourceFileState(newState.options.compilerPackageName, action.api, newState, state.code, state.options);
      urlSaver.updateUrl(state.code);
      return newState;
    }
    case actionNames.SET_CODE: {
      return { ...state, code: action.code };
    }
    case actionNames.SET_OPTIONS: {
      return {
        ...state,
        options: {
          ...state.options,
          ...action.options,
        },
        editorTheme: deriveEditorTheme(action.options.theme || state.options.theme),
      };
    }
    case actionNames.OS_THEME_CHANGE: {
      return {
        ...state,
        editorTheme: deriveEditorTheme(state.options.theme),
      };
    }
    default: {
      // eslint-disable-next-line
      const assertNever: never = action;
      return state;
    }
  }
}

export function deriveEditorTheme(theme: Theme): CodeEditorTheme {
  switch (theme) {
    case Theme.OS:
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    case Theme.Dark:
      return "dark";
    case Theme.Light:
      return "light";
  }
}

function fillNewSourceFileState(compilerPackageName: CompilerPackageNames, api: CompilerApi, state: StoreState, code: string, options: OptionsState) {
  const { sourceFile, bindingTools } = createSourceFile(api, code, options.scriptTarget, options.scriptKind);
  state.compiler = {
    packageName: compilerPackageName,
    api,
    sourceFile,
    bindingTools,
    selectedNode: sourceFile,
  };
}
