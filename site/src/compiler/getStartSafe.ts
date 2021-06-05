import { Node, SourceFile } from "./CompilerApi";

export function getStartSafe(node: Node, sourceFile: SourceFile) {
    // workaround for compiler api bug with getStart(sourceFile, true) (see PR #35029 in typescript repo)
    const jsDocs = ((node as any).jsDoc) as Node[] | undefined;
    if (jsDocs && jsDocs.length > 0)
        return jsDocs[0].getStart(sourceFile);
    return node.getStart(sourceFile);
}
