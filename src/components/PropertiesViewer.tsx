import React from "react";
import { TypeChecker, Node, SourceFile, Symbol, Type, Signature, ReadonlyMap, CompilerApi, PublicApiInfo, CompilerPackageNames, getPublicApiInfo, CommentRange } from "../compiler";
import CircularJson from "circular-json";
import { css as cssConstants } from "../constants";
import { BindingTools, CompilerState } from "../types";
import { ArrayUtils, getSyntaxKindName, getEnumFlagNames } from "../utils";
import { LazyTreeView } from "./LazyTreeView";
import { ToolTippedText } from "./ToolTippedText";

export interface PropertiesViewerProps {
    compiler: CompilerState;
    sourceFile: SourceFile;
    bindingTools: () => BindingTools;
    selectedNode: Node;
    bindingEnabled: boolean;
    showInternals: boolean;
}

export interface PropertiesViewerState {
    publicApiInfo: PublicApiInfo | undefined | false;
    lastCompilerPackageName: CompilerPackageNames | undefined;
}

export class PropertiesViewer extends React.Component<PropertiesViewerProps, PropertiesViewerState> {
    constructor(props: PropertiesViewerProps) {
        super(props);
        this.state = {
            publicApiInfo: undefined,
            lastCompilerPackageName: undefined
        };
    }

    render() {
        this.updatePublicApiInfo();
        const { selectedNode, sourceFile, bindingEnabled, bindingTools } = this.props;
        const context: Context = { api: this.props.compiler.api, publicApiInfo: this.state.publicApiInfo, sourceFile };
        return (
            <div className="propertiesViewer">
                <div className="container">
                    <h2>Node</h2>
                    <div id={cssConstants.properties.node.id}>
                        {getForSelectedNode(context, selectedNode)}
                    </div>
                    {bindingEnabled && getBindingSection(context, selectedNode, bindingTools().typeChecker)}
                </div>
            </div>
        );
    }

    private updatePublicApiInfo() {
        if (this.props.showInternals) {
            if (this.state.publicApiInfo != null)
                setTimeout(() => this.setState({ publicApiInfo: undefined }), 0);
            return;
        }

        if (this.state.lastCompilerPackageName === this.props.compiler.packageName && this.state.publicApiInfo != null)
            return;

        // todo: how to not do this in a render method? I'm not a react or web person
        setTimeout(() => {
            this.setState({
                publicApiInfo: undefined,
                lastCompilerPackageName: this.props.compiler.packageName
            });

            getPublicApiInfo(this.props.compiler.packageName).then(publicApiInfo => {
                this.setState({ publicApiInfo });
            }).catch(err => {
                console.error(err);
                this.setState({ publicApiInfo: false });
            });
        }, 0);
    }
}

interface Context {
    api: CompilerApi;
    publicApiInfo: PublicApiInfo | undefined | false;
    sourceFile: SourceFile;
}

function getBindingSection(context: Context, selectedNode: Node, typeChecker: TypeChecker) {
    return (
        <>
            <h2>Type</h2>
            <div id={cssConstants.properties.type.id}>
                {getForType(context, selectedNode, typeChecker)}
            </div>
            <h2>Symbol</h2>
            <div id={cssConstants.properties.symbol.id}>
                {getForSymbol(context, selectedNode, typeChecker)}
            </div>
            <h2>Signature</h2>
            <div id={cssConstants.properties.signature.id}>
                {getForSignature(context, selectedNode, typeChecker)}
            </div>
        </>
    );
}

function getForSelectedNode(context: Context, selectedNode: Node) {
    return (<LazyTreeView nodeLabel={getSyntaxKindName(context.api, selectedNode.kind)} defaultCollapsed={false} getChildren={getChildren} />);

    function getChildren() {
        const { sourceFile } = context;
        return (
            <>
                {getProperties(context, selectedNode)}
                {getMethodElement("getChildCount()", selectedNode.getChildCount(sourceFile))}
                {getMethodElement("getFullStart()", selectedNode.getFullStart())}
                {getMethodElement("getStart()", selectedNode.getStart(sourceFile))}
                {getMethodElement("getStart(sourceFile, true)", selectedNode.getStart(sourceFile, true))}
                {getMethodElement("getFullWidth()", selectedNode.getFullWidth())}
                {getMethodElement("getWidth()", selectedNode.getWidth(sourceFile))}
                {getMethodElement("getLeadingTriviaWidth()", selectedNode.getLeadingTriviaWidth(sourceFile))}
                {getMethodElement("getFullText()", selectedNode.getFullText(sourceFile))}
                {/* Need to do this because internally typescript doesn't pass the sourceFile to getStart() in TokenOrIdentifierObject (bug in ts I need to report...) */}
                {getMethodElement("getText()", sourceFile.text.substring(selectedNode.getStart(context.sourceFile), selectedNode.getEnd()))}
                {/* comments */}
                {getForCommentRanges(`ts.getLeadingCommentRanges(fileFullText, ${selectedNode.getFullStart()})`, context.api.getLeadingCommentRanges(context.sourceFile.text, selectedNode.getFullStart()))}
                {getForCommentRanges(`ts.getTrailingCommentRanges(fileFullText, ${selectedNode.end})`, context.api.getTrailingCommentRanges(context.sourceFile.text, selectedNode.end))}
            </>
        );
    }

    function getMethodElement(name: string, result: string | number) {
        return getTextDiv(name, typeof result === "string" ? result : JSON.stringify(result));
    }

    function getForCommentRanges(name: string, commentRanges: CommentRange[] | undefined) {
        if (commentRanges == null)
            return getTextDiv(name, "undefined");
        else
            return getArrayDiv(context, name, commentRanges);
    }
}

function getForType(context: Context, node: Node, typeChecker: TypeChecker) {
    if (node.kind === context.api.SyntaxKind.SourceFile)
        return (<>[None]</>);

    const type = getOrReturnError(() => typeChecker.getTypeAtLocation(node));
    if (type == null)
        return (<>[None]</>);
    if (typeof type === "string")
        return (<>[Error getting type: {type}]</>);

    return getTreeView(context, type, getTypeToString() || "Type");

    function getTypeToString() {
        try {
            return typeChecker.typeToString(type as Type, node);
        } catch (err) {
            return `[Problem getting type text: ${err}]`;
        }
    }
}

function getForSymbol(context: Context, node: Node, typeChecker: TypeChecker) {
    const symbol = getOrReturnError(() => ((node as any).symbol as Symbol | undefined) || typeChecker.getSymbolAtLocation(node));
    if (symbol == null)
        return (<>[None]</>);
    if (typeof symbol === "string")
        return (<>[Error getting symbol: {symbol}]</>);

    return getTreeView(context, symbol, getSymbolName() || "Symbol");

    function getSymbolName() {
        try {
            return (symbol as Symbol).getName();
        } catch (err) {
            return `[Problem getting symbol name: ${err}]`;
        }
    }
}

function getForSignature(context: Context, node: Node, typeChecker: TypeChecker) {
    const signature = getOrReturnError(() => typeChecker.getSignatureFromDeclaration(node as any));
    if (signature == null || typeof signature === "string")
        return (<>[None]</>);

    return getTreeView(context, signature, "Signature");
}

function getOrReturnError<T>(getFunc: () => T): T | string {
    try {
        return getFunc();
    } catch (err) {
        return JSON.stringify(err);
    }
}

function getTreeView(context: Context, obj: any, label: string) {
    return (<LazyTreeView nodeLabel={label} defaultCollapsed={false} getChildren={() => getProperties(context, obj)} />);
}

function getProperties(context: Context, obj: any) {
    const keyValues = getObjectKeys(context, obj).map(key => ({ key, value: obj[key] }));

    const values = (
        <>
            {keyValues.map(kv => (getNodeKeyValue(kv.key, kv.value, obj)))}
        </>
    );
    return values;

    function getNodeKeyValue(key: string, value: any, parent: any): JSX.Element {
        if (value === null)
            return getTextDiv(key, "null");
        else if (value === undefined)
            return getTextDiv(key, "undefined");
        else if (value instanceof Array)
            return getArrayDiv(context, key, value);
        else if (isTsNode(value))
            return getNodeDiv(context, key, value);
        else if (isMap(value))
            return getMapDiv(context, key, value);
        else if (typeof value === "object")
            return getObjectDiv(context, key, value);
        else
            return getCustomValueDiv(context, key, value, parent);
    }
}

function getArrayDiv(context: Context, key: string, value: unknown[]) {
    if (value.length === 0)
        return getTextDiv(key, "[]");
    else {
        return (
            <div className="array" key={key} data-name={key}>
                <div className="key">{key}: [</div>
                <div className="value">{value.map((v, i) => getTreeNode(context, v, undefined, i))}</div>
                <div className="suffix">]</div>
            </div>
        );
    }
}

function getMapDiv(context: Context, key: string, value: ReadonlyMap<unknown>) {
    const entries = ArrayUtils.from(value.entries());
    if (entries.length === 0)
        return getTextDiv(key, "{}");
    else {
        return (
            <div className="array" key={key} data-name={key}>
                <div className="key">{key}:{"{"}</div>
                <div className="value">{entries.map((v, i) => getTreeNode(context, v[1], v[0], i))}</div>
                <div className="suffix">{"}"}</div>
            </div>
        );
    }
}

function getObjectDiv(context: Context, key: string, value: unknown) {
    if (getObjectKeys(context, value).length === 0)
        return getTextDiv(key, "{}");
    else {
        return (
            <div className="object" key={key} data-name={key}>
                <div className="key">{key}:</div>
                <div className="value">{getTreeNode(context, value)}</div>
            </div>
        );
    }
}

function getCustomValueDiv(context: Context, key: string, value: any, parent: any) {
    return (
        <div className="text" key={key} data-name={key}>
            <div className="key">{key}:</div>
            <div className="value">{getCustomValue()}</div>
        </div>
    );

    function getCustomValue() {
        if (isTsNode(parent)) {
            switch (key) {
                case "kind":
                    return `${value} (SyntaxKind.${getSyntaxKindName(context.api, value)})`;
                case "flags":
                    return getEnumFlagElement(context.api.NodeFlags, value);
            }
        }
        if (isTsType(parent) && key === "objectFlags")
            return getEnumFlagElement(context.api.ObjectFlags, value);
        if (isTsType(parent) && key === "flags")
            return getEnumFlagElement(context.api.TypeFlags, value);
        if (isTsSymbol(parent) && key === "flags")
            return getEnumFlagElement(context.api.SymbolFlags, value);
        return CircularJson.stringify(value);
    }
}

function getNodeDiv(context: Context, key: string, value: Node) {
    return (
        <div className="object" key={key} data-name={key}>
            <div className="key">{key}:</div>
            <div className="value">{getTreeNode(context, value)}</div>
        </div>
    );
}

function getTextDiv(key: string | undefined, value: string) {
    return (
        <div className="text" key={key} data-name={key}>
            {key == null ? undefined : <div className="key">{key}:</div>}
            <div className="value">{value}</div>
        </div>
    );
}

function getTreeNode(context: Context, value: any, key?: string, index?: number): JSX.Element {
    const labelName = getLabelName(context, value);
    key = getKey();

    if (typeof value === "string")
        return getTextDiv(key, `"${value}"`);
    if (typeof value === "number")
        return getTextDiv(key, value.toString());
    if (typeof value === "boolean")
        return getTextDiv(key, value.toString());
    return (
        <LazyTreeView nodeLabel={key} key={index} defaultCollapsed={true} getChildren={() => getProperties(context, value)} />
    );

    function getKey() {
        if (key == null)
            return labelName;
        else if (labelName != null)
            return `${key}: ${getLabelName(context, value)}`;
        return key;
    }
}

function getLabelName(context: Context, obj: any) {
    if (obj == null)
        return undefined;
    if (isTsNode(obj))
        return appendName(getSyntaxKindName(context.api, obj.kind));
    if (isTsSignature(obj))
        return appendName("Signature");
    if (isTsType(obj))
        return appendName("Type");
    if (isTsSymbol(obj))
        return appendName("Symbol");
    const objType = typeof obj;
    if (objType === "string" || objType === "number" || objType === "boolean")
        return undefined;
    return appendName("Object");

    function appendName(title: string) {
        const name = getName();
        return name == null ? title : `${title} (${name})`;
    }

    function getName() {
        try {
            if (typeof obj.getName === "function")
                return obj.getName();
            if (isTsNode(obj) && (obj as any).name != null) {
                const name = (obj as any).name as Node;
                return name.getText();
            }
            return undefined;
        } catch (err) {
            return undefined;
        }
    }
}

function getObjectKeys(context: Context, obj: any) {
    if (obj == null)
        return [];
    return Object.keys(obj).filter(key => isAllowedKey(context, obj, key));
}

const nodeDisallowedKeys = new Set(["parent", "_children", "symbol"]);
const typeDisallowedKeys = new Set(["checker", "symbol"]);
function isAllowedKey(context: Context, obj: any, key: string) {
    const { publicApiInfo } = context;
    if (isTsNode(obj)) {
        if (nodeDisallowedKeys.has(key))
            return false;
        if (!publicApiInfo)
            return true;
        const kindName = getSyntaxKindName(context.api, obj.kind);
        return hasInProperties(publicApiInfo.nodePropertiesBySyntaxKind.get(kindName));
    }
    if (isTsType(obj))
        return !typeDisallowedKeys.has(key) && hasInProperties(publicApiInfo && publicApiInfo.typeProperties);
    if (isTsSignature(obj))
        return hasInProperties(publicApiInfo && publicApiInfo.signatureProperties);
    if (isTsSymbol(obj))
        return hasInProperties(publicApiInfo && publicApiInfo.symbolProperties);
    return true;

    function hasInProperties(publicApiProperties: Set<string> | undefined | false) {
        return !publicApiProperties || publicApiProperties.has(key);
    }
}

function isMap(value: any): value is ReadonlyMap<unknown> {
    return typeof value.keys === "function"
        && typeof value.values === "function";
}

function isTsNode(value: any): value is Node {
    return typeof (value as Node).kind === "number";
}

function isTsType(value: any): value is Type {
    return (value as Type).getBaseTypes != null;
}

function isTsSymbol(value: any): value is Symbol {
    return (value as Symbol).getDeclarations != null;
}

function isTsSignature(value: any): value is Signature {
    if (value.declaration == null)
        return false;
    return isTsNode(value.declaration);
}

function getEnumFlagElement(enumObj: any, value: number) {
    const names = getEnumFlagNames(enumObj, value);
    if (names.length === 0)
        return <>{value}</>;

    return <ToolTippedText text={value.toString()}>{getNames()}</ToolTippedText>;

    function getNames() {
        return <ul>{names.map((name, i) => (<li key={i}>{name}</li>))}</ul>;
    }
}
