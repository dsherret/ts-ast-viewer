import { type JSX, useLayoutEffect } from "react";
import TreeView from "react-treeview";
import { type CompilerApi, getChildrenFunction, type Node, type SourceFile } from "../compiler/index.js";
import type { TreeMode } from "../types/index.js";
import { getSyntaxKindName } from "../utils/index.js";

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
  // todo: refactor to use refs
  useLayoutEffect(() => {
    const treeViewer = document.getElementById("treeViewer");
    const selectedNode = document.querySelector(`#treeViewer .selected`);
    if (treeViewer && selectedNode) {
      const selectedRect = selectedNode.getBoundingClientRect();
      const treeViewerRect = treeViewer.getBoundingClientRect();
      if (selectedRect.y < 0 || selectedRect.y + selectedRect.height > treeViewerRect.height) {
        selectedNode.scrollIntoView({ block: "center", inline: "center" });
      }
    }
  }, [selectedNode]);
  return <div id="treeViewer">{renderNode(sourceFile, getChildrenFunction(mode, sourceFile))}</div>;

  function renderNode(node: Node, getChildren: (node: Node) => readonly Node[]): JSX.Element {
    const children = getChildren(node);
    const className = "nodeText" + (node === selectedNode ? " selected" : "");
    const kindName = getSyntaxKindName(api, node.kind);
    const label = <div onClick={() => onSelectNode(node)} className={className}>{kindName}</div>;
    if (children.length === 0) {
      return <div key={i++} className="endNode" data-name={kindName}>{label}</div>;
    } else {
      return (
        <div data-name={kindName} key={i++}>
          <TreeView nodeLabel={label}>
            {children.map((n) => renderNode(n, getChildren))}
          </TreeView>
        </div>
      );
    }
  }
}
