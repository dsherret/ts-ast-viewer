import React from "react";
import SplitPane from "react-split-pane";
import * as components from "./components";
import ts from "typescript";
import {StoreState} from "./types";
import {createSourceFile} from "./helpers";
import "./App.css";

export interface Props extends StoreState {
    onSourceFileChange: (sourceFile: ts.SourceFile) => void;
    onPosChange: (pos: number) => void;
    onNodeChange: (node: ts.Node) => void;
}

export default function App(props: Props) {
    return (
        <div className="App">
            <SplitPane split="horizontal" defaultSize={50} allowResize={false}>
                <div className="App-header">
                    <h2>TypeScript AST Viewer</h2>
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
                            onSelectNode={node => props.onNodeChange(node)}/>
                        <components.PropertiesViewer
                            selectedNode={props.selectedNode}
                            sourceFile={props.sourceFile} />
                    </SplitPane>
                </SplitPane>
            </SplitPane>
        </div>
    );

    function onCodeChange(code: string) {
        const sourceFile = ts.createSourceFile("ts-ast-viewer.tsx", code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
        props.onSourceFileChange(sourceFile);
    }
}
