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
        const {sourceFile, selectedNode, onSelectNode} = this.props;
        let i = 0;

        return (
            <div className="treeViewer">{renderNode(this.props.sourceFile)}</div>
        );

        function renderNode(node: ts.Node): JSX.Element {
            const children = node.getChildren(sourceFile);
            const className = node === selectedNode ? "selected nodeText" : "nodeText";
            const label = (<div onClick={() => onSelectNode(node)} className={className}>{ts.SyntaxKind[node.kind]}</div>);
            if (children.length === 0)
                return (
                    <div key={i++} className="endNode">{label}</div>
                );
            else
                return (
                    <TreeView nodeLabel={label} key={i++}>
                        {node.getChildren(sourceFile).map(n => renderNode(n))}
                    </TreeView>
                );
        }
    }
}
