import * as React from "react";
import * as SplitPane from "react-split-pane";
import * as components from "./components";
import * as ts from "typescript";
import {StoreState} from "./types";
import {createSourceFile} from "./helpers";
import "./App.css";

export interface Props extends StoreState {
    onSourceFileChange: (sourceFile: ts.SourceFile) => void;
    onPosChange: (pos: number) => void;
}

export default function App(props: Props) {
    return (
        <div className="App">
            <SplitPane split="horizontal" defaultSize={50} allowResize={false}>
                <div className="App-header">
                    <h2>TypeScript AST Viewer</h2>
                </div>
                <SplitPane split="vertical" minSize={50} defaultSize="40%">
                    <components.CodeEditor
                        onChange={code => onCodeChange(code)}
                        onClick={pos => props.onPosChange(pos)}
                        text={props.sourceFile.text} />
                    <SplitPane split="vertical" minSize={50} defaultSize="60%">
                        <div></div>
                        <components.PropertiesViewer
                            selectedNode={props.selectedNode}
                            sourceFile={props.sourceFile} />
                    </SplitPane>
                </SplitPane>
            </SplitPane>
        </div>
    );

    function onCodeChange(code: string) {
        const sourceFile = ts.createSourceFile("ts-ast-viewer.ts", code, ts.ScriptTarget.Latest, false, ts.ScriptKind.Unknown);
        props.onSourceFileChange(sourceFile);
    }
}
