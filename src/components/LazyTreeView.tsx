import { type JSX, useState } from "react";
import TreeView from "react-treeview";

export interface LazyTreeViewProps {
  defaultCollapsed: boolean;
  nodeLabel: string | undefined;
  getChildren: () => JSX.Element;
}

export function LazyTreeView(props: LazyTreeViewProps) {
  const [isCollapsed, setIsCollapsed] = useState(props.defaultCollapsed);

  const label = <span className="treeViewLabel" onClick={toggleState}>{props.nodeLabel}</span>;

  return (
    <TreeView nodeLabel={label} collapsed={isCollapsed} onClick={toggleState}>
      {isCollapsed ? undefined : props.getChildren()}
    </TreeView>
  );

  function toggleState() {
    setIsCollapsed(!isCollapsed);
  }
}
