import { constants } from "@ts-ast-viewer/shared";
import { useAppContext } from "AppContext";
import SplitPane from "react-split-pane";
import "./App.css";
import { getDescendantAtRange, getStartSafe } from "./compiler";
import * as components from "./components";
import { ApiLoadingState } from "./types";

export function App() {
    const { state, dispatch } = useAppContext();
    const compiler = state.compiler;

    return (
        <div className="App">
            <SplitPane split="horizontal" defaultSize={50} allowResize={false}>
                <header className="AppHeader clearfix">
                    <h2 id="title">TypeScript AST Viewer</h2>
                    <components.Options
                        api={compiler == null ? undefined : compiler.api}
                        options={state.options}
                        onChange={options =>
                            dispatch({
                                type: "SET_OPTIONS",
                                options,
                            })}
                    />
                </header>
                <SplitPane split="vertical" minSize={50} defaultSize="33%">
                    {getCodeEditorArea()}
                    {getCompilerDependentPanes()}
                </SplitPane>
            </SplitPane>
        </div>
    );

    function getCodeHighlightRange() {
        if (compiler == null)
            return undefined;

        const { selectedNode, sourceFile } = compiler;
        return selectedNode === sourceFile ? undefined : {
            start: getStartSafe(selectedNode, sourceFile),
            end: selectedNode.end,
        };
    }

    function getCodeEditorArea() {
        if (state.options.showFactoryCode) {
            return (
                <SplitPane split="horizontal" defaultSize={window.innerHeight * 0.70}>
                    {getCodeEditor()}
                    {getFactoryCodeEditor()}
                </SplitPane>
            );
        }
        else {
            return getCodeEditor();
        }

        function getFactoryCodeEditor() {
            if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading)
                return <components.Spinner />;

            return (
                <components.ErrorBoundary getResetHash={() => state.code}>
                    <components.FactoryCodeEditor compiler={compiler} />
                </components.ErrorBoundary>
            );
        }

        function getCodeEditor() {
            return (
                <components.CodeEditor
                    id={constants.css.mainCodeEditor.id}
                    onChange={code => dispatch({ type: "SET_CODE", code })}
                    onClick={range => {
                        if (compiler == null)
                            return;
                        const descendant = getDescendantAtRange(
                            state.options.treeMode,
                            compiler.sourceFile,
                            range,
                            compiler.api,
                        );
                        dispatch({ type: "SET_SELECTED_NODE", node: descendant });
                    }}
                    text={state.code}
                    highlight={getCodeHighlightRange()}
                    showInfo={true}
                    renderWhiteSpace={true}
                    editorDidMount={codeEditorDidMount}
                />
            );
        }
    }

    function getCompilerDependentPanes() {
        if (compiler == null || state.apiLoadingState === ApiLoadingState.Loading)
            return <components.Spinner />;
        else if (state.apiLoadingState === ApiLoadingState.Error)
            return <div className={"errorMessage"}>Error loading compiler API. Please refresh the page to try again.</div>;

        return (
            <components.ErrorBoundary>
                <SplitPane split="vertical" minSize={50} defaultSize="50%">
                    <components.TreeViewer
                        api={compiler.api}
                        selectedNode={compiler.selectedNode}
                        sourceFile={compiler.sourceFile}
                        onSelectNode={node => dispatch({ type: "SET_SELECTED_NODE", node })}
                        mode={state.options.treeMode}
                    />
                    <components.PropertiesViewer
                        compiler={compiler}
                        selectedNode={compiler.selectedNode}
                        sourceFile={compiler.sourceFile}
                        bindingTools={compiler.bindingTools}
                        bindingEnabled={state.options.bindingEnabled}
                        showInternals={state.options.showInternals}
                    />
                </SplitPane>
            </components.ErrorBoundary>
        );
    }

    function codeEditorDidMount(editor: import("monaco-editor").editor.IStandaloneCodeEditor) {
        // For some reason a slight delay is necessary here. Otherwise it won't let the user type.
        setTimeout(() => editor.focus(), 100);

        // global method for cypress
        (window as any).setMonacoEditorText = (text: string) => {
            const editorModel = editor.getModel();
            if (editorModel == null)
                return;

            editor.executeEdits("my-source", [{
                range: editorModel.getFullModelRange(),
                text,
            }]);
        };
    }
}
