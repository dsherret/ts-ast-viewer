import React from "react";
import ts from "typescript";
import TreeView from "react-treeview";
import CircularJson from "circular-json";
import {getSyntaxKindName} from "../utils";
import {TreeMode} from "../types";

export interface TreeViewerProps {
    sourceFile: ts.SourceFile;
    selectedNode: ts.Node;
    onSelectNode: (node: ts.Node) => void;
    mode: TreeMode;
}

export class TreeViewer extends React.Component<TreeViewerProps> {
    render() {
        const {sourceFile, selectedNode, onSelectNode, mode} = this.props;
        let i = 0;

        return (
            <div className="treeViewer">{renderNode(this.props.sourceFile, getChildrenFunc())}</div>
        );

        function renderNode(node: ts.Node, getChildren: (node: ts.Node) => (ts.Node[])): JSX.Element {
            const children = node.getChildren(sourceFile);
            const className = node === selectedNode ? "selected nodeText" : "nodeText";
            const label = (<div onClick={() => onSelectNode(node)} className={className}>{getSyntaxKindName(node.kind)}</div>);
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

        function getAllChildren(node: ts.Node) {
            return node.getChildren(sourceFile);
        }

        function forEachChild(node: ts.Node) {
            const nodes: ts.Node[] = [];
            ts.forEachChild(node, child => {
                nodes.push(child);
                return undefined;
            });
            return nodes;
        }
    }
}
