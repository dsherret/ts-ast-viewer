import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { ScriptTarget, ScriptKind } from "./compiler";
import AppContainer from "./AppContainer";
import { unregisterServiceWorker } from "./registerServiceWorker";
import "./index.css";
import "./external/react-treeview.css";
import "./external/react-splitpane.css";
import { StoreState, TreeMode, ApiLoadingState } from "./types";
import { appReducer } from "./reducers";

const initialScriptTarget: ScriptTarget = 6 /* Latest */;
const initialScriptKind: ScriptKind = 4 /* TSX */;
const initialCode = "";
const store = createStore<StoreState>(appReducer, {
    apiLoadingState: ApiLoadingState.Loading,
    code: initialCode,
    options: {
        compilerPackageName: "typescript",
        treeMode: TreeMode.getChildren,
        scriptTarget: initialScriptTarget,
        scriptKind: initialScriptKind
    },
    compiler: undefined
});

ReactDOM.render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("root") as HTMLElement
);

// doing this for now because service workers were not playing nicely with the website being updated every day for @next support
unregisterServiceWorker();

// set global variables
console.log("[ts-ast-viewer]: Inspect the selectedNode, sourceFile, symbol, type, program, and typeChecker global variables here in the console.");
store.subscribe(() => {
    const state = store.getState();
    if (state.compiler == null || state.compiler.selectedNode == null)
        return;

    const windowAny = window as any;
    const selectedNode = state.compiler.selectedNode;
    windowAny.selectedNode = selectedNode;
    windowAny.sourceFile = state.compiler.sourceFile;
    windowAny.typeChecker = state.compiler.typeChecker;
    windowAny.program = state.compiler.program;
    windowAny.type = tryGet(() => state.compiler!.typeChecker.getTypeAtLocation(selectedNode));
    windowAny.symbol = tryGet(() => (selectedNode as any).symbol || state.compiler!.typeChecker.getSymbolAtLocation(selectedNode));

    function tryGet<T>(getValue: () => T) {
        try {
            return getValue();
        } catch {
            return undefined;
        }
    }
});
