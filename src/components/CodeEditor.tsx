import React from "react";
import brace from "brace";
import AceEditor from "react-ace";
import "brace/mode/typescript";
import "brace/theme/monokai";

const AceEditorExtended: any = AceEditor;

export interface CodeEditorProps {
    onChange: (text: string) => void;
    onClick: (pos: number) => void;
    text: string;
}

export class CodeEditor extends React.Component<CodeEditorProps> {
    render() {
        return (
            <div className="codeEditor">
                <AceEditorExtended
                    mode="typescript"
                    theme="monokai"
                    setOptions={{ tabSize: 4, useSoftTabs: true }}
                    onChange={(text: string) => this.props.onChange(text)}
                    width="100%"
                    height="100%"
                    value={this.props.text}
                    showPrintMargin={false} />
                {/*<textarea onChange={event => onChange(event.target.value)} onClick={event => onClick(event.currentTarget.selectionStart)}></textarea>*/}
            </div>
        );
    }
}
