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
