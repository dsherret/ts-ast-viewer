import * as React from "react";
import * as ts from "typescript";
import * as TreeView from "react-treeview";
import * as CircularJson from "circular-json";

export interface TreeViewerProps {
    sourceFile: ts.SourceFile;
    selectedNode: ts.Node;
    onSelectNode: (node: ts.Node) => void;
}

export class TreeViewer extends React.Component<TreeViewerProps> {
    render() {
        const {sourceFile, onSelectNode} = this.props;
        let i = 0;

        return (
            <div className="treeViewer">{renderNode(this.props.sourceFile)}</div>
        );

        function renderNode(node: ts.Node): JSX.Element {
            return (
                <div className="node" key={i++}>
                    <div className="name" onClick={() => onSelectNode(node)}>{ts.SyntaxKind[node.kind]}</div>
                    {node.getChildren(sourceFile).map(n => renderNode(n))}
                </div>
            );
        }
    }
}
