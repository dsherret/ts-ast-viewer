import React, { Component, useState } from "react";
import TreeView from "react-treeview";

export interface LazyTreeViewState {
    collapsed: boolean;
}

export interface LazyTreeViewProps {
    defaultCollapsed: boolean;
    nodeLabel: React.ReactNode;
    getChildren: () => JSX.Element;
}

export function LazyTreeView(props: LazyTreeViewProps) {
    const [isCollapsed, setIsCollapsed] = useState(props.defaultCollapsed);

    return (<TreeView nodeLabel={props.nodeLabel} collapsed={isCollapsed} onClick={toggleState}>{isCollapsed ? undefined : props.getChildren()}</TreeView>);

    function toggleState() {
        setIsCollapsed(!isCollapsed);
    }
}
