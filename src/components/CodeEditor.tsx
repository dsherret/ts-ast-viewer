import React from "react";
import ReactMonacoEditorForTypes from "react-monaco-editor";
import * as monacoEditorForTypes from "monaco-editor";
import { Spinner } from "./Spinner";
import { css as cssConstants } from "../constants";

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
            this.setState({ editorComponent: editor.default });
        }).catch(err => {
            this.setState({ editorComponent: false });
        });
    }

    render() {
        return (
            <div id={cssConstants.codeEditor.id}>
                <div id={cssConstants.codeEditor.containerId}>
                    {this.getEditor()}
                </div>
                <div id={cssConstants.codeEditor.infoId}>Pos {this.state.position}, Ln {this.state.lineNumber}, Col {this.state.column}</div>
            </div>
        );
    }

    private getEditor() {
        if (this.state.editorComponent == null)
            return <Spinner backgroundColor="#1e1e1e" />;
        if (this.state.editorComponent === false)
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

    private editorDidMount(editor: monacoEditorForTypes.editor.IStandaloneCodeEditor) {
        editor.onDidChangeCursorPosition(e => {
            this.setState({
                position: editor.getModel().getOffsetAt(e.position),
                lineNumber: e.position.lineNumber,
                column: e.position.column
            });
        });
        editor.focus();

        // global method for cypress
        (window as any).setMonacoEditorText = (text: string) => {
            const selection = editor.getSelection();
            
            editor.executeEdits("my-source", [{
                range: editor.getModel().getFullModelRange(),
                text
            }]);
        };
    }
}
