// Renders the Type and Symbol for the selected node when using tsgo.
// Unlike classic TS (whose checker is in-process), TSGO's Type/Symbol are remote
// handle-based proxies: scalar fields read synchronously once the object is
// fetched, but collections (properties, members, base types, signatures, …) are
// async calls on the proxy or the checker.
//
// When a Type/Symbol node is expanded, ALL its collections are evaluated up front
// (in parallel) and only the non-empty ones are shown — so you don't have to click
// each collection to discover what's there. Recursion stays bounded because a
// nested node's collections aren't evaluated until you expand that node.
import { type JSX, useEffect, useState } from "react";
import type { CompilerApi, Node } from "../compiler/index.js";
import type { AsyncBinding } from "../types/index.js";
import { enumUtils, getSyntaxKindName } from "../utils/index.js";
import { LazyTreeView } from "./LazyTreeView.js";
import { Spinner } from "./Spinner.js";
import { ToolTippedText } from "./ToolTippedText.js";

/** Arrays/collections with more than this many items start collapsed. */
const COLLAPSE_THRESHOLD = 10;

export interface TsgoBindingViewerProps {
  api: CompilerApi;
  binding: AsyncBinding;
  node: Node;
  showInternals: boolean;
}

export function TsgoBindingViewer(props: TsgoBindingViewerProps) {
  const { api, binding, node, showInternals } = props;
  return (
    <>
      <h2>Type</h2>
      <div id="type">
        <AsyncValue
          key={"type-" + nodeKey(node)}
          load={() => isSourceFile(api, node) ? Promise.resolve(undefined) : binding.getType(node)}
          render={(type) =>
            type == null
              ? <>[None]</>
              : <TypeNode api={api} binding={binding} type={type} showInternals={showInternals} open />}
        />
      </div>
      <h2>Symbol</h2>
      <div id="symbol">
        <AsyncValue
          key={"symbol-" + nodeKey(node)}
          load={() => binding.getSymbol(node)}
          render={(symbol) =>
            symbol == null
              ? <>[None]</>
              : <SymbolNode api={api} binding={binding} symbol={symbol} showInternals={showInternals} open />}
        />
      </div>
    </>
  );
}

interface NodeProps {
  api: CompilerApi;
  binding: AsyncBinding;
  showInternals: boolean;
  open?: boolean;
}

function TypeNode(props: NodeProps & { type: any }) {
  const { api, binding, type, showInternals } = props;
  const label = useDerived(() => binding.typeToString(type), "Type", [type]);
  return (
    <LazyTreeView
      nodeLabel={label}
      defaultCollapsed={!props.open}
      getChildren={() => (
        <>
          {syncFields(api, type, "type", showInternals)}
          <Collections collections={typeCollections(props, type)} />
        </>
      )}
    />
  );
}

function SymbolNode(props: NodeProps & { symbol: any }) {
  const { api, symbol, showInternals } = props;
  return (
    <LazyTreeView
      nodeLabel={symbol.name || "Symbol"}
      defaultCollapsed={!props.open}
      getChildren={() => (
        <>
          {syncFields(api, symbol, "symbol", showInternals)}
          <Collections collections={symbolCollections(props, symbol)} />
        </>
      )}
    />
  );
}

// --- collections ----------------------------------------------------------

interface Collection {
  label: string;
  /** Fetch the collection; may resolve to an object, array, Map, or undefined. */
  load: () => Promise<any>;
  render: (item: any) => JSX.Element;
}

function typeCollections(props: NodeProps, type: any): Collection[] {
  const { binding } = props;
  const c = binding.checker;
  const asType = (t: any) => <TypeNode {...props} type={t} open={false} />;
  const asSymbol = (s: any) => <SymbolNode {...props} symbol={s} open={false} />;
  const signatureKind = (props.api as any).SignatureKind;
  return [
    { label: "symbol", load: () => call(type.getSymbol), render: asSymbol },
    { label: "aliasSymbol", load: () => call(type.getAliasSymbol), render: asSymbol },
    { label: "target", load: () => call(type.getTarget), render: asType },
    { label: "apparentType", load: () => call(c.getApparentType, c, type), render: asType },
    { label: "properties", load: () => call(c.getPropertiesOfType, c, type), render: asSymbol },
    { label: "typeArguments", load: () => call(c.getTypeArguments, c, type), render: asType },
    { label: "baseTypes", load: () => call(type.getBaseTypes), render: asType },
    { label: "types", load: () => call(type.getTypes), render: asType },
    { label: "typeParameters", load: () => call(type.getTypeParameters), render: asType },
    {
      label: "callSignatures",
      load: () => call(c.getSignaturesOfType, c, type, signatureKind?.Call),
      render: renderSignature,
    },
    {
      label: "constructSignatures",
      load: () => call(c.getSignaturesOfType, c, type, signatureKind?.Construct),
      render: renderSignature,
    },
    {
      label: "indexInfos",
      load: () => call(c.getIndexInfosOfType, c, type),
      render: (info) => <ObjectFields api={props.api} obj={info} kind="type" showInternals={props.showInternals} />,
    },
  ];
}

function symbolCollections(props: NodeProps, symbol: any): Collection[] {
  const { binding } = props;
  const c = binding.checker;
  const asType = (t: any) => <TypeNode {...props} type={t} open={false} />;
  const asSymbol = (s: any) => <SymbolNode {...props} symbol={s} open={false} />;
  return [
    { label: "type", load: () => call(c.getTypeOfSymbol, c, symbol), render: asType },
    { label: "parent", load: () => call(symbol.getParent), render: asSymbol },
    { label: "members", load: () => call(symbol.getMembers), render: asSymbol },
    { label: "exports", load: () => call(symbol.getExports), render: asSymbol },
  ];
}

/** Evaluate every collection in parallel (on expand), then show the non-empty ones. */
function Collections(props: { collections: Collection[] }) {
  const [resolved, setResolved] = useState<{ label: string; items: any[]; render: (i: any) => JSX.Element }[]>();
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      props.collections.map(async (c) => ({ label: c.label, render: c.render, items: toItems(await c.load()) })),
    )
      .then((all) => !cancelled && setResolved(all.filter((r) => r.items.length > 0)))
      .catch(() => !cancelled && setResolved([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (resolved == null) return <Spinner />;
  return (
    <>
      {resolved.map((r) => (
        <LazyTreeView
          key={r.label}
          nodeLabel={r.items.length > 1 ? `${r.label} (${r.items.length})` : r.label}
          defaultCollapsed={r.items.length > COLLAPSE_THRESHOLD}
          getChildren={() => <>{r.items.map((item, i) => <div key={i}>{r.render(item)}</div>)}</>}
        />
      ))}
    </>
  );
}

/** Normalize an object / array / Map / undefined result to a list of items. */
function toItems(value: any): any[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return Array.from(value.values());
  return [value];
}

function renderSignature(): JSX.Element {
  return <span>Signature</span>;
}

// --- async plumbing -------------------------------------------------------

/** Fetch on mount (only mounted when its parent expands) → Spinner → render. */
function AsyncValue<T>(props: { load: () => Promise<T>; render: (value: T) => JSX.Element }) {
  const [state, setState] = useState<{ s: "loading" } | { s: "done"; v: T } | { s: "error" }>({ s: "loading" });
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(props.load)
      .then((v) => !cancelled && setState({ s: "done", v }))
      .catch(() => !cancelled && setState({ s: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);
  if (state.s === "loading") return <Spinner />;
  if (state.s === "error") return <>[error]</>;
  return props.render(state.v);
}

// --- synchronous field rendering ------------------------------------------

// handle-number pointers (resolved instead via the collections above) and internals
const HIDDEN_KEYS = new Set([
  "objectRegistry",
  "canonicalProject",
  "membersCache",
  "exportsCache",
  "checker",
  "symbol",
  "aliasSymbol",
  "target",
  "freshType",
  "regularType",
  "objectType",
  "indexType",
  "checkType",
  "extendsType",
  "baseType",
  "substConstraint",
  "typeParameters",
  "outerTypeParameters",
  "localTypeParameters",
  "aliasTypeArguments",
  "parent",
  "exportSymbol",
  "path",
  "index",
]);

function ObjectFields(props: { api: CompilerApi; obj: any; kind: "type" | "symbol"; showInternals: boolean }) {
  return <>{syncFields(props.api, props.obj, props.kind, props.showInternals)}</>;
}

function syncFields(api: CompilerApi, obj: any, kind: "type" | "symbol", showInternals: boolean): JSX.Element[] {
  return Object.keys(obj)
    .filter((key) => !HIDDEN_KEYS.has(key) && typeof obj[key] !== "function")
    // treat underscore-prefixed fields as internal (hidden unless "Show internals")
    .filter((key) => showInternals || !key.startsWith("_"))
    .map((key) => fieldDiv(api, key, obj[key], kind, key.startsWith("_")))
    .filter((el): el is JSX.Element => el != null);
}

function fieldDiv(
  api: CompilerApi,
  key: string,
  value: any,
  kind: "type" | "symbol",
  internal: boolean,
): JSX.Element | null {
  const el = fieldValueDiv(api, key, value, kind);
  if (el == null || !internal) return el;
  return <div className="internal" key={key} data-name={key}>{el}</div>;
}

function fieldValueDiv(api: CompilerApi, key: string, value: any, kind: "type" | "symbol"): JSX.Element | null {
  const a = api as any;
  if (key === "flags") return textDiv(key, flagsElement(kind === "type" ? a.TypeFlags : a.SymbolFlags, value));
  if (key === "objectFlags") return textDiv(key, flagsElement(a.ObjectFlags, value));
  if (key === "elementFlags" && Array.isArray(value)) {
    return textDiv(key, <ul>{value.map((f, i) => <li key={i}>{flagsElement(a.ElementFlags, f)}</li>)}</ul>);
  }
  if (key === "declarations" && Array.isArray(value)) {
    return textDiv(key, value.length === 0 ? "[]" : value.map((d) => declarationName(api, d)).join(", "));
  }
  if (key === "valueDeclaration" && value != null) return textDiv(key, declarationName(api, value));
  if (Array.isArray(value)) return textDiv(key, JSON.stringify(value));
  if (value != null && typeof value === "object") return null; // nested objects handled by the collections
  return textDiv(key, formatScalar(value));
}

function declarationName(api: CompilerApi, handle: any): string {
  if (handle != null && typeof handle.kind === "number") return getSyntaxKindName(api, handle.kind);
  return String(handle);
}

function flagsElement(enumObj: any, value: number): JSX.Element {
  const lines = enumObj == null ? undefined : enumUtils.getEnumFlagLines(enumObj, value);
  if (!lines || lines.length === 0) return <>{value}</>;
  return (
    <ToolTippedText text={value.toString()}>
      <ul>{lines.map((line, i) => <li key={i}>{line}</li>)}</ul>
    </ToolTippedText>
  );
}

function formatScalar(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function textDiv(key: string, value: string | JSX.Element): JSX.Element {
  return (
    <div className="text" key={key} data-name={key}>
      <div className="key">{key}:</div>
      <div className="value">{value}</div>
    </div>
  );
}

// --- misc helpers ----------------------------------------------------------

/** Call an optional proxy/checker method defensively, tolerating rejection. */
// deno-lint-ignore no-explicit-any
function call(fn: any, thisArg?: any, ...args: any[]): Promise<any> {
  if (typeof fn !== "function") return Promise.resolve(undefined);
  return Promise.resolve().then(() => fn.apply(thisArg, args)).catch(() => undefined);
}

function isSourceFile(api: CompilerApi, node: Node): boolean {
  return node.kind === (api.SyntaxKind as any).SourceFile;
}

function nodeKey(node: Node): string {
  return `${node.kind}:${(node as any).pos}:${(node as any).end}`;
}

/** Resolve an async label, showing a fallback until it arrives. */
function useDerived(load: () => Promise<string | undefined>, fallback: string, deps: unknown[]): string {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    let cancelled = false;
    setValue(fallback);
    Promise.resolve().then(load).then((v) => !cancelled && v != null && setValue(v)).catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
