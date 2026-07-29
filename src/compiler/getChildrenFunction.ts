import { TreeMode } from "../types/index.js";
import { assertNever } from "../utils/index.js";
import type { Node, SourceFile } from "./CompilerApi.js";

export function getChildrenFunction(mode: TreeMode, sourceFile: SourceFile) {
  switch (mode) {
    case TreeMode.getChildren:
      return getAllChildren;
    case TreeMode.forEachChild:
      return forEachChild;
    default:
      return assertNever(mode, `Unhandled mode: ${mode}`);
  }

  function getAllChildren(node: Node) {
    // TypeScript 7.0 nodes have no getChildren(); fall back to forEachChild there
    // (its token-inclusive tree isn't available yet for the native port).
    if (typeof node.getChildren !== "function") {
      return forEachChild(node);
    }
    return node.getChildren(sourceFile);
  }

  function forEachChild(node: Node) {
    const nodes: Node[] = [];
    node.forEachChild((child) => {
      nodes.push(child);
      return undefined;
    });
    return nodes;
  }
}
