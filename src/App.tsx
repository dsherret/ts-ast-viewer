import React from "react";
import SplitPane from "react-split-pane";
import * as components from "./components";
import ts from "typescript";
import {StoreState, OptionsState} from "./types";
import {createSourceFile} from "./helpers";
import "./App.css";

export interface Props extends StoreState {
    onSourceFileChange: (sourceFile: ts.SourceFile) => void;
    onPosChange: (pos: number) => void;
    onNodeChange: (node: ts.Node) => void;
    onOptionsChange: (options: OptionsState) => void;
}

export default function App(props: Props) {
    return (
        <div className="App">
            <SplitPane split="horizontal" defaultSize={50} allowResize={false}>
                <div className="App-header clearfix">
                    <h2 id="title">TypeScript AST Viewer</h2>
                    <components.Options
                        options={props.options}
                        onChange={options => props.onOptionsChange(options)}/>
                </div>
                <SplitPane split="vertical" minSize={50} defaultSize="33%">
                    <components.CodeEditor
                        onChange={code => onCodeChange(code)}
                        onClick={pos => props.onPosChange(pos)}
                        text={props.sourceFile.text} />
                    <SplitPane split="vertical" minSize={50} defaultSize="50%">
                        <components.TreeViewer
                            selectedNode={props.selectedNode}
                            sourceFile={props.sourceFile}
                            onSelectNode={node => props.onNodeChange(node)}
                            mode={props.options.treeMode} />
                        <components.PropertiesViewer
                            selectedNode={props.selectedNode}
                            sourceFile={props.sourceFile} />
                    </SplitPane>
                </SplitPane>
            </SplitPane>
        </div>
    );

    function onCodeChange(code: string) {
        const sourceFile = createSourceFile(code, props.options.scriptTarget, props.options.scriptKind);
        props.onSourceFileChange(sourceFile);
    }
}
