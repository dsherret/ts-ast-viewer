import { Project, Symbol, ts, InterfaceDeclaration, Type } from "ts-morph";

export class TsAnalyzer {
    private readonly tsSymbol: Symbol;

    constructor(typeScriptModuleName: string) {
        const project = new Project({ compilerOptions: { strictNullChecks: true } });
        const tsSourceFile = project.addExistingSourceFile(`node_modules/${typeScriptModuleName}/lib/typescript.d.ts`);

        this.tsSymbol = tsSourceFile.getNamespaceOrThrow("ts").getSymbolOrThrow();
    }

    getSymbolProperties() {
        return this.getPropertiesForExport("Symbol");
    }

    getTypeProperties() {
        return this.getPropertiesForExport("Type");
    }

    getSignatureProperties() {
        return this.getPropertiesForExport("Signature");
    }

    getNodePropertiesBySyntaxKind() {
        const result = new Map<string, Set<string>>();
        const exports = this.tsSymbol.getExports()

        for (const node of getNodes()) {
            const type = node.getDeclarations()[0].getType();
            const kindText = getKindOfNodeSymbol(node)!;
            if (!result.has(kindText))
                result.set(kindText, new Set());

            const properties = result.get(kindText)!;
            for (const prop of type.getProperties()) {
                if (isAllowedProperty(prop))
                    properties.add(prop.getName());
            }
        }

        // add the comment ranges in as well
        result.set("SingleLineCommentTrivia", this.getPropertiesForExport("CommentRange"));
        result.set("MultiLineCommentTrivia", this.getPropertiesForExport("CommentRange"));

        return result;

        function* getNodes() {
            for (const symbol of exports) {
                if (isNode(symbol))
                    yield symbol;
            }

            function isNode(symbol: Symbol) {
                return getKindOfNodeSymbol(symbol) != null;
            }
        }

        function getKindOfNodeSymbol(symbol: Symbol) {
            const kind = symbol.getMember("kind");
            if (kind == null)
                return undefined;
            const kindDeclaration = kind.getDeclarations()[0];
            const kindTypeText = kind.getTypeAtLocation(kindDeclaration).getText(kindDeclaration);
            if (!kindTypeText.startsWith("SyntaxKind."))
                return undefined;
            return kindTypeText.replace(/^SyntaxKind\./, "");
        }
    }

    private getPropertiesForExport(name: string) {
        const exports = this.tsSymbol.getExports();
        const symbolType = this.tsSymbol.getExportOrThrow(name).getDeclaredType();
        const properties = new Set<string>();

        for (const symbol of getSymbolSymbols()) {
            for (const prop of symbol.getDeclaredType().getProperties()) {
                if (isAllowedProperty(prop))
                    properties.add(prop.getName());
            }
        }

        return properties;

        function* getSymbolSymbols() {
            for (const symbol of exports) {
                const type = symbol.getDeclaredType();
                if (hasBaseSymbolType(type))
                    yield symbol;
            }

            function hasBaseSymbolType(type: Type) {
                if (type === symbolType)
                    return true;

                for (const baseType of type.getBaseTypes()) {
                    if (hasBaseSymbolType(baseType))
                        return true;
                }

                return false;
            }
        }
    }
}

function isAllowedProperty(prop: Symbol) {
    const name = prop.getName();
    if (name.startsWith("_") && name.endsWith("Brand"))
        return false;
    return true;
}