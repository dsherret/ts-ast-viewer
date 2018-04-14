import React from "react";
import { SourceFile, Node, CompilerApi } from "../compiler";
import TreeView from "react-treeview";
import CircularJson from "circular-json";
import { getSyntaxKindName } from "../utils";
import { TreeMode } from "../types";

export interface TreeViewerProps {
    api: CompilerApi;
    sourceFile: SourceFile;
    selectedNode: Node;
    onSelectNode: (node: Node) => void;
    mode: TreeMode;
}

export class TreeViewer extends React.Component<TreeViewerProps> {
    render() {
        const {sourceFile, selectedNode, onSelectNode, mode, api} = this.props;
        let i = 0;

        return (
            <div className="treeViewer">{renderNode(this.props.sourceFile, getChildrenFunc())}</div>
        );

        function renderNode(node: Node, getChildren: (node: Node) => (Node[])): JSX.Element {
            const children = node.getChildren(sourceFile);
            const className = node === selectedNode ? "selected nodeText" : "nodeText";
            const label = (<div onClick={() => onSelectNode(node)} className={className}>{getSyntaxKindName(api, node.kind)}</div>);
            if (children.length === 0)
                return (
                    <div key={i++} className="endNode">{label}</div>
                );
            else
                return (
                    <TreeView nodeLabel={label} key={i++}>
                        {getChildren(node).map(n => renderNode(n, getChildren))}
                    </TreeView>
                );
        }

        function getChildrenFunc() {
            switch (mode) {
                case TreeMode.getChildren:
                    return getAllChildren;
                case TreeMode.forEachChild:
                    return forEachChild;
                default:
                    const assertNever: never = mode;
                    throw new Error(`Unhandled mode: ${mode}`);
            }
        }

        function getAllChildren(node: Node) {
            return node.getChildren(sourceFile);
        }

        function forEachChild(node: Node) {
            const nodes: Node[] = [];
            api.forEachChild(node, child => {
                nodes.push(child);
                return undefined;
            });
            return nodes;
        }
    }
}
