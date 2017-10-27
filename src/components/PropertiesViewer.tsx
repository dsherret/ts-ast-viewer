import * as React from "react";
import * as ts from "typescript";
import * as TreeView from "react-treeview";
import * as CircularJson from "circular-json";

export interface PropertiesViewerProps {
    sourceFile: ts.SourceFile;
    selectedNode: ts.Node;
}

export function PropertiesViewer({selectedNode, sourceFile}: PropertiesViewerProps) {
    const keyValues = Object.keys(selectedNode).map(key => ({ key, value: selectedNode[key] }));
    return (
        <div>
            <h2>Properties</h2>
            {getTreeView(selectedNode)}
            <h3>Full Text</h3>
            <pre>{selectedNode.getFullText(sourceFile)}</pre>
            <h3>Text</h3>
            {/* Need to do this because internally typescript doesn't pass the sourceFile to getStart() in TokenOrIdentifierObject (bug in ts) */}
            <pre>{sourceFile.text.substring(selectedNode.getStart(sourceFile), selectedNode.getEnd())}</pre>
        </div>
    );
}

function getTreeView(parentNode: ts.Node) {
    const handledNodes: ts.Node[] = [];

    return getTreeNode(parentNode);

    function getTreeNode(value: any): JSX.Element {
        const isNode = typeof (value as ts.Node).kind === "number";
        if (isNode) {
            const node = value as ts.Node;
            if (handledNodes.indexOf(node) >= 0 || parentNode.kind !== ts.SyntaxKind.SourceFile && node.kind === ts.SyntaxKind.SourceFile)
                return (<div>[Circular]</div>);
            handledNodes.push(node);
        }

        const keyValues = Object.keys(value).filter(key => isNode && key !== "parent").map(key => ({ key, value: value[key] }));
        const label = typeof (value as ts.Node).kind === "number" ? ts.SyntaxKind[(value as ts.Node).kind] : "value";
        return (
            <TreeView nodeLabel={label}>
                {keyValues.map(kv => (
                    <div>
                        <div>{kv.key}</div>
                        <div>{getNodeValue(kv.value)}</div>
                    </div>
                ))}
            </TreeView>
        );
    }

    function getNodeValue(value: any) {
        if (value == null)
            return value;
        else if (value instanceof Array)
            return (
                <div>
                [{value.map(v => getTreeNode(v))}]
                </div>
            )
        else if (typeof (value as ts.Node).kind === "number")
            return getTreeNode(value as ts.Node);
        else
            return CircularJson.stringify(value);
    }
}
