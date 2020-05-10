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
import { ApiLoadingState } from "./types";
import { appReducer } from "./reducers";
import { StateSaver, UrlSaver } from "./utils";

const initialScriptTarget: ScriptTarget = 6 /* Latest */;
const initialScriptKind: ScriptKind = 4 /* TSX */;
const stateSaver = new StateSaver();

const store = createStore(appReducer, {
    apiLoadingState: ApiLoadingState.Loading,
    code: new UrlSaver().getUrlCode(),
    options: {
        compilerPackageName: "typescript",
        treeMode: stateSaver.get().treeMode,
        scriptTarget: initialScriptTarget,
        scriptKind: initialScriptKind,
        bindingEnabled: true,
        showFactoryCode: stateSaver.get().showFactoryCode,
        showInternals: stateSaver.get().showInternals,
    },
    compiler: undefined,
});

ReactDOM.render(
    <Provider store={store}><AppContainer /></Provider>,
    document.getElementById("root") as HTMLElement,
);

// doing this for now because service workers were not playing nicely with the website being updated every day for @next support
unregisterServiceWorker();

// save changes
store.subscribe(() => {
    const state = store.getState();
    if (state.options == null)
        return;

    const savedState = stateSaver.get();
    savedState.treeMode = state.options.treeMode;
    savedState.showFactoryCode = state.options.showFactoryCode;
    savedState.showInternals = state.options.showInternals;
    stateSaver.set(savedState);
});

// set global variables
console.log(
    "[ts-ast-viewer]: Inspect the ts, sourceFile, node, symbol, type, signature, program, and checker/typeChecker global variables here in the console.",
);
store.subscribe(() => {
    const state = store.getState();
    if (state.compiler == null || state.compiler.selectedNode == null)
        return;

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
        windowAny.symbol = tryGet(() => (selectedNode as any).symbol || bindingTools.typeChecker.getSymbolAtLocation(selectedNode));
        windowAny.signature = tryGet(() => bindingTools.typeChecker.getSignatureFromDeclaration(selectedNode as any));
    }
    else {
        windowAny.typeChecker = undefined;
        windowAny.program = undefined;
        windowAny.type = undefined;
        windowAny.symbol = undefined;
        windowAny.signature = undefined;
    }

    function tryGet<T>(getValue: () => T) {
        try {
            return getValue();
        } catch (err) {
            return undefined;
        }
    }
});
