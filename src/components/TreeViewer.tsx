import React from "react";
import TreeView from "react-treeview";
import { CompilerApi, getChildrenFunction, Node, SourceFile } from "../compiler";
import { css as cssConstants } from "../constants";
import { TreeMode } from "../types";
import { getSyntaxKindName } from "../utils";

export interface TreeViewerProps {
    api: CompilerApi;
    sourceFile: SourceFile;
    selectedNode: Node;
    onSelectNode: (node: Node) => void;
    mode: TreeMode;
}

export class TreeViewer extends React.Component<TreeViewerProps> {
    render() {
        const { sourceFile, selectedNode, onSelectNode, mode, api } = this.props;
        let i = 0;

        return (
            <div id={cssConstants.treeViewer.id}>{renderNode(this.props.sourceFile, getChildrenFunction(mode, sourceFile))}</div>
        );

        function renderNode(node: Node, getChildren: (node: Node) => (Node[])): JSX.Element {
            const children = getChildren(node);
            const className = "nodeText" + (node === selectedNode ? " " + cssConstants.treeViewer.selectedNodeClass : "");
            const kindName = getSyntaxKindName(api, node.kind);
            const label = (<div onClick={() => onSelectNode(node)} className={className}>{kindName}</div>);
            if (children.length === 0) {
                return (
                    <div key={i++} className="endNode" data-name={kindName}>{label}</div>
                );
            }
            else {
                return (
                    <div data-name={kindName} key={i++}>
                        <TreeView nodeLabel={label}>
                            {children.map(n => renderNode(n, getChildren))}
                        </TreeView>
                    </div>
                );
            }
        }
    }
}
