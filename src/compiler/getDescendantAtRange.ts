import { TreeMode } from "../types";
import { getChildrenFunction } from "./getChildrenFunction";
import { Node, SourceFile, CompilerApi } from "./CompilerApi";

export function getDescendantAtRange(mode: TreeMode, sourceFile: SourceFile, range: [number, number], compilerApi: CompilerApi) {
    const getChildren = getChildrenFunction(mode, sourceFile);
    const syntaxKinds = compilerApi.SyntaxKind;

    let bestMatch: { node: Node; start: number; } = { node: sourceFile, start: sourceFile.getStart(sourceFile) };
    searchDescendants(sourceFile);
    return bestMatch.node;

    function searchDescendants(node: Node) {
        const children = getChildren(node);
        for (const child of children) {
            if (isBeforeRange(child.end))
                continue;

            // workaround for compiler api bug (see PR #35029 in typescript repo)
            const jsDocs = ((child as any).jsDoc) as Node[] | undefined;
            const childStart = jsDocs && jsDocs.length > 0 ? jsDocs[0].pos : child.getStart(sourceFile);

            if (isAfterRange(childStart))
                return;

            const isChildSyntaxList = child.kind === syntaxKinds.SyntaxList;
            const isEndOfFileToken = child.kind === syntaxKinds.EndOfFileToken;
            const hasSameStart = bestMatch.start === childStart && range[0] === childStart;
            if (!isChildSyntaxList && !isEndOfFileToken && !hasSameStart)
                bestMatch = { node: child, start: childStart };

            searchDescendants(child);
        }
    }

    function isBeforeRange(pos: number) {
        return pos < range[0];
    }

    function isAfterRange(nodeEnd: number) {
        return nodeEnd >= range[0] && nodeEnd > range[1];
    }
}
