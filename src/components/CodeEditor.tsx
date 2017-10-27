import * as React from "react";

export interface CodeEditorProps {
    onChange: (text: string) => void;
    onClick: (pos: number) => void;
}

export function CodeEditor({onChange, onClick}: CodeEditorProps) {
    return (
        <div className="code-editor">
            <textarea onChange={event => onChange(event.target.value)} onClick={event => onClick(event.currentTarget.selectionStart)}></textarea>
        </div>
    );
}
