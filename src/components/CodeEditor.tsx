import React from "react";
import MonacoEditor from "react-monaco-editor";

export interface CodeEditorProps {
    onChange: (text: string) => void;
    onClick: (pos: number) => void;
    text: string;
}

export class CodeEditor extends React.Component<CodeEditorProps> {
    render() {
        return (
            <div className="codeEditor">
                <MonacoEditor
                    width="100%"
                    height="100%"
                    value={this.props.text}
                    theme="vs-dark"
                    language="typescript"
                    onChange={(text) => this.props.onChange(text)}
                    options={{ automaticLayout: true, renderWhitespace: "all" }} />
            </div>
        );
    }
}
