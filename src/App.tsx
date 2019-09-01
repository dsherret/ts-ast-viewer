import React from "react";
import SplitPane from "react-split-pane";
import * as components from "./components";
import { Node, CompilerPackageNames } from "./compiler";
import { css as cssConstants } from "./constants";
import { StoreState, OptionsState, ApiLoadingState } from "./types";
import "./App.css";

export interface Props extends StoreState {
    onCodeChange: (compilerPackageName: CompilerPackageNames, code: string) => void;
    onRangeChange: (range: [number, number]) => void;
    onNodeChange: (node: Node) => void;
    onOptionsChange: (compilerPackageName: CompilerPackageNames, options: Partial<OptionsState>) => void;
}

export default function App(props: Props) {
    const compiler = props.compiler;

    return (
        <div className="App">
            <SplitPane split="horizontal" defaultSize={50} allowResize={false}>
                <header className="AppHeader clearfix">
                    <h2 id="title">TypeScript AST Viewer</h2>
                    <components.Options
                        api={compiler == null ? undefined : compiler.api}
                        options={props.options}
                        onChange={options => props.onOptionsChange(options.compilerPackageName || props.options.compilerPackageName, options)}
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
        if (props.compiler == null)
            return undefined;

        const { selectedNode, sourceFile } = props.compiler;
        return selectedNode === sourceFile ? undefined : {
            start: selectedNode.getStart(sourceFile, true),
            end: selectedNode.end
        };
    }

    function getCodeEditorArea() {
        if (props.options.showFactoryCode) {
            return (
                <SplitPane split="horizontal" defaultSize="75%">
                    {getCodeEditor()}
                    {getFactoryCodeEditor()}
                </SplitPane>
            );
        }
        else {
            return getCodeEditor();
        }

        function getFactoryCodeEditor() {
            if (compiler == null || props.apiLoadingState === ApiLoadingState.Loading)
                return <components.Spinner />;

            return (
                <components.ErrorBoundary getResetHash={() => props.code}>
                    <components.FactoryCodeEditor compiler={compiler} />;
                </components.ErrorBoundary>
            );
        }

        function getCodeEditor() {
            return (
                <components.CodeEditor
                    id={cssConstants.mainCodeEditor.id}
                    onChange={code => props.onCodeChange(props.options.compilerPackageName, code)}
                    onClick={range => props.onRangeChange(range)}
                    text={props.code}
                    highlight={getCodeHighlightRange()}
                    showInfo={true}
                    renderWhiteSpace={true}
                    editorDidMount={codeEditorDidMount}
                />
            );
        }
    }

    function getCompilerDependentPanes() {
        if (compiler == null || props.apiLoadingState === ApiLoadingState.Loading)
            return <components.Spinner />;
        else if (props.apiLoadingState === ApiLoadingState.Error)
            return <div className={"errorMessage"}>Error loading compiler API. Please refresh the page to try again.</div>;

        return (
            <components.ErrorBoundary>
                <SplitPane split="vertical" minSize={50} defaultSize="50%">
                    <components.TreeViewer
                        api={compiler.api}
                        selectedNode={compiler.selectedNode}
                        sourceFile={compiler.sourceFile}
                        onSelectNode={node => props.onNodeChange(node)}
                        mode={props.options.treeMode}
                    />
                    <components.PropertiesViewer
                        api={compiler.api}
                        selectedNode={compiler.selectedNode}
                        sourceFile={compiler.sourceFile}
                        bindingTools={compiler.bindingTools}
                        bindingEnabled={props.options.bindingEnabled}
                    />
                </SplitPane>
            </components.ErrorBoundary>
        );
    }

    function codeEditorDidMount(editor: import("monaco-editor").editor.IStandaloneCodeEditor) {
        editor.focus();

        // global method for cypress
        (window as any).setMonacoEditorText = (text: string) => {
            const editorModel = editor.getModel();
            if (editorModel == null)
                return;

            editor.executeEdits("my-source", [{
                range: editorModel.getFullModelRange(),
                text
            }]);
        };
    }
}
