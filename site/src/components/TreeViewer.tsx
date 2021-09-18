import { constants, TreeMode } from "@ts-ast-viewer/shared";
import React, { useLayoutEffect } from "react";
import TreeView from "react-treeview";
import { CompilerApi, getChildrenFunction, Node, SourceFile } from "../compiler";
import { getSyntaxKindName } from "../utils";

export interface TreeViewerProps {
  api: CompilerApi;
  sourceFile: SourceFile;
  selectedNode: Node;
  onSelectNode: (node: Node) => void;
  mode: TreeMode;
}

export function TreeViewer(props: TreeViewerProps) {
  const { sourceFile, selectedNode, onSelectNode, mode, api } = props;
  let i = 0;
  useLayoutEffect(() => {
    const treeViewer = document.getElementById(constants.css.treeViewer.id);
    const selectedNode = document.querySelector(`#${constants.css.treeViewer.id} .${constants.css.treeViewer.selectedNodeClass}`);
    if (treeViewer && selectedNode) {
      const selectedRect = selectedNode.getBoundingClientRect();
      const treeViewerRect = treeViewer.getBoundingClientRect();
      if (selectedRect.y < 0 || selectedRect.y + selectedRect.height > treeViewerRect.height) {
        selectedNode.scrollIntoView({ block: "center", inline: "center" });
      }
    }
  }, [selectedNode]);
  return <div id={constants.css.treeViewer.id}>{renderNode(sourceFile, getChildrenFunction(mode, sourceFile))}</div>;

  function renderNode(node: Node, getChildren: (node: Node) => (Node[])): JSX.Element {
    const children = getChildren(node);
    const className = "nodeText" + (node === selectedNode ? " " + constants.css.treeViewer.selectedNodeClass : "");
    const kindName = getSyntaxKindName(api, node.kind);
    const label = <div onClick={() => onSelectNode(node)} className={className}>{kindName}</div>;
    if (children.length === 0) {
      return <div key={i++} className="endNode" data-name={kindName}>{label}</div>;
    } else {
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
