import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as monacoEditor from "monaco-editor";

export interface CodeEditorProps {
    onChange: (text: string) => void;
    onClick: (pos: number) => void;
    text: string;
}

export interface CodeEditorState {
    position: number;
    lineNumber: number;
    column: number;
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            position: 0,
            lineNumber: 0,
            column: 0
        };
        this.editorDidMount = this.editorDidMount.bind(this);
    }

    render() {
        return (
            <div className="codeEditor">
                <div className="editorContainer">
                    <MonacoEditor
                        width="100%"
                        height="100%"
                        value={this.props.text}
                        theme="vs-dark"
                        language="typescript"
                        onChange={text => this.props.onChange(text)}
                        editorDidMount={this.editorDidMount}
                        options={{
                            automaticLayout: true,
                            renderWhitespace: "all"
                        }} />
                </div>
                <div className="editorInfo">Pos {this.state.position}, Ln {this.state.lineNumber}, Col {this.state.column}</div>
            </div>
        );
    }

    editorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
        editor.onDidChangeCursorPosition(e => {
            this.setState({
                position: editor.getModel().getOffsetAt(e.position),
                lineNumber: e.position.lineNumber,
                column: e.position.column
            });
        });
    }
}
