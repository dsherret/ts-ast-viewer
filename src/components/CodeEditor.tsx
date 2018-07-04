import React from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import * as monacoEditor from "monaco-editor";
import { Spinner } from "./Spinner";

export interface CodeEditorProps {
    onChange: (text: string) => void;
    onClick: (pos: number) => void;
    text: string;
}

export interface CodeEditorState {
    position: number;
    lineNumber: number;
    column: number;
    editorComponent: (typeof ReactMonacoEditorForTypes) | undefined | false;
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            position: 0,
            lineNumber: 0,
            column: 0,
            editorComponent: undefined
        };
        this.editorDidMount = this.editorDidMount.bind(this);

        import("react-monaco-editor").then(editor => {
            this.setState({ editorComponent: editor.default })
        }).catch(err => {
            this.setState({ editorComponent: false })
        });
    }

    render() {
        return (
            <div className="codeEditor">
                <div className="editorContainer">
                    {this.getEditor()}
                </div>
                <div className="editorInfo">Pos {this.state.position}, Ln {this.state.lineNumber}, Col {this.state.column}</div>
            </div>
        );
    }

    private getEditor() {
        if (this.state.editorComponent == null)
            return <Spinner backgroundColor="#1e1e1e" />;
        if (this.state.editorComponent == false)
            return <div className={"errorMessage"}>Error loading code editor. Please refresh the page to try again.</div>;

        return (<this.state.editorComponent
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
            }} />);
    }

    private editorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
        editor.onDidChangeCursorPosition(e => {
            this.setState({
                position: editor.getModel().getOffsetAt(e.position),
                lineNumber: e.position.lineNumber,
                column: e.position.column
            });
        });
    }
}
