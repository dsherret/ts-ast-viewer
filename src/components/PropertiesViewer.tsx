import React from "react";
import ts from "typescript";
import TreeView from "react-treeview";
import CircularJson from "circular-json";
import {getSyntaxKindName, createHashSet} from "../utils";

export interface PropertiesViewerProps {
    sourceFile: ts.SourceFile;
    typeChecker: ts.TypeChecker;
    selectedNode: ts.Node;
}

export class PropertiesViewer extends React.Component<PropertiesViewerProps> {
    render() {
        const {selectedNode, sourceFile, typeChecker} = this.props;
        const keyValues = Object.keys(selectedNode).map(key => ({ key, value: selectedNode[key] }));
        return (
            <div className="propertiesViewer">
                <div className="container">
                    <h2>Node</h2>
                    <div className="node">
                        <TreeView nodeLabel={getSyntaxKindName(selectedNode.kind)} defaultCollapsed={false}>
                            {getProperties(selectedNode)}
                            {getMethodElement("getChildCount()", selectedNode.getChildCount(sourceFile))}
                            {getMethodElement("getFullStart()", selectedNode.getFullStart())}
                            {getMethodElement("getStart()", selectedNode.getStart(sourceFile))}
                            {getMethodElement("getStart(sourceFile, true)", selectedNode.getStart(sourceFile, true))}
                            {getMethodElement("getFullWidth()", selectedNode.getFullWidth())}
                            {getMethodElement("getWidth()", selectedNode.getWidth(sourceFile))}
                            {getMethodElement("getLeadingTriviaWidth()", selectedNode.getLeadingTriviaWidth(sourceFile))}
                            {getMethodElement("getFullText()", selectedNode.getFullText(sourceFile))}
                            {/* Need to do this because internally typescript doesn't pass the sourceFile to getStart() in TokenOrIdentifierObject (bug in ts) */}
                            {getMethodElement("getText()", sourceFile.text.substring(selectedNode.getStart(sourceFile), selectedNode.getEnd()))}
                        </TreeView>
                    </div>
                    <h2>Type</h2>
                    <div className="type">
                        {getForType(selectedNode, typeChecker)}
                    </div>
                    <h2>Symbol</h2>
                    <div className="symbol">
                        {getForSymbol(selectedNode, typeChecker)}
                    </div>
                    <h2>Signature</h2>
                    <div className="signature">
                        {getForSignature(selectedNode, typeChecker)}
                    </div>
                </div>
            </div>
        );

        function getMethodElement(name: string, result: string | number) {
            return (
                <div className="method" key={name}>
                    <span className="methodName">{name}:</span>
                    <span className="methodResult">{typeof result === "string" ? JSON.stringify(result) : result}</span>
                </div>
            );
        }
    }
}

function getForType(node: ts.Node, typeChecker: ts.TypeChecker) {
    const type = getOrReturnError(() => typeChecker.getTypeAtLocation(node));
    if (node.kind === ts.SyntaxKind.SourceFile)
        return (<div>[None]</div>);
    if (typeof type === "string")
        return (<div>[Error getting type: {type}]</div>);

    return getTreeView(type, getTypeToString() || "Type");

    function getTypeToString() {
        try {
            return typeChecker.typeToString(type as ts.Type, node);
        } catch (err) {
            return `[Problem getting type text: ${err}]`;
        }
    }
}

function getForSymbol(node: ts.Node, typeChecker: ts.TypeChecker) {
    const symbol = getOrReturnError(() => (node["symbol"] as ts.Symbol | undefined) || typeChecker.getSymbolAtLocation(node));
    if (symbol == null)
        return (<div>[None]</div>);
    if (typeof symbol === "string")
        return (<div>[Error getting symbol: {symbol}]</div>);

    return getTreeView(symbol, getSymbolName() || "Symbol");

    function getSymbolName() {
        try {
            return (symbol as ts.Symbol).getName();
        } catch (err) {
            return `[Problem getting symbol name: ${err}]`;
        }
    }
}

function getForSignature(node: ts.Node, typeChecker: ts.TypeChecker) {
    const signature = getOrReturnError(() => typeChecker.getSignatureFromDeclaration(node as any));
    if (signature == null || typeof signature === "string")
        return (<div>[None]</div>);

    return getTreeView(signature, "Signature");
}

function getOrReturnError<T>(getFunc: () => T): T | string {
    try {
        return getFunc();
    } catch (err) {
        return JSON.stringify(err);
    }
}

function getTreeView(rootItem: any, rootLabel: string) {
    return (<TreeView nodeLabel={rootLabel} defaultCollapsed={false}>
        {getProperties(rootItem)}
    </TreeView>);
}

function getProperties(rootItem: any) {
    const shownObjects = createHashSet<any>();
    let i = 0;
    return getNodeKeyValuesForObject(rootItem);

    function getTreeNode(value: any, parent: any): JSX.Element {
        if (isTsNode(value)) {
            if (isTsNode(rootItem) && rootItem.kind !== ts.SyntaxKind.SourceFile && value.kind === ts.SyntaxKind.SourceFile)
                return (<div>[Circular]</div>);
        }

        const label = typeof (value as ts.Node).kind === "number" ? getSyntaxKindName((value as ts.Node).kind) : "Object";

        return (
            <TreeView nodeLabel={label} key={i++} defaultCollapsed={true}>
                {getNodeKeyValuesForObject(value)}
            </TreeView>
        );
    }

    function getNodeKeyValuesForObject(obj: any) {
        if (shownObjects.has(obj))
            return (<div>[Circular]</div>);
        shownObjects.add(obj);
        const keyValues = Object.keys(obj).filter(key => isAllowedKey(obj, key)).map(key => ({ key, value: obj[key] }));

        const values = (
            <div>
                {keyValues.map(kv => (getNodeValue(kv.key, kv.value, obj)))}
            </div>
        );
        shownObjects.delete(obj);
        return values;
    }

    function getNodeValue(key: string, value: any, parent: any): JSX.Element {
        if (value === null)
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">null</div>
                </div>);
        else if (value === undefined)
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">undefined</div>
                </div>);
        else if (value instanceof Array) {
            if (value.length === 0)
                return (
                    <div className="text" key={key}>
                        <div className="key">{key}:</div>
                        <div className="value">[]</div>
                    </div>);
            else
                return (
                    <div className="array" key={key}>
                        <div className="key">{key}: [</div>
                        <div className="value">{value.map(v => getTreeNode(v, value))}</div>
                        <div className="suffix">]</div>
                    </div>);
        }
        else if (isTsNode(value))
            return (
                <div className="object" key={key}>
                    <div className="key">{key}: {"{"}</div>
                    <div className="value">{getTreeNode(value, parent)}</div>
                    <div className="suffix">{"}"}</div>
                </div>);
        else if (typeof value === "object")
            return (
                <div className="object" key={key}>
                    <div className="key">{key}: {"{"}</div>
                    <div className="value">{getNodeKeyValuesForObject(value)}</div>
                    <div className="suffix">{"}"}</div>
                </div>);
        else
            return (
                <div className="text" key={key}>
                    <div className="key">{key}:</div>
                    <div className="value">{getCustomValue()}</div>
                </div>);

        function getCustomValue() {
            if (isTsNode(parent) && key === "kind")
                return `${value} (SyntaxKind.${getSyntaxKindName(value)})`;
            return CircularJson.stringify(value);
        }
    }
}

const nodeDisallowedKeys = ["parent", "_children", "symbol"];
const typeDisallowedKeys = ["checker", "symbol"];
function isAllowedKey(obj: any, key: string) {
    if (isTsNode(obj))
        return nodeDisallowedKeys.indexOf(key) === -1;
    if (isTsType(obj))
        return typeDisallowedKeys.indexOf(key) === -1;
    return true;
}

function isTsNode(value: any): value is ts.Node {
    return typeof (value as ts.Node).kind === "number";
}

function isTsType(value: any): value is ts.Type {
    return typeof (value as ts.Type).getBaseTypes != null;
}