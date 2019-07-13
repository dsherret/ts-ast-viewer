import { Project, VariableDeclarationKind, SyntaxKind, NewLineKind, StructureKind } from "ts-morph";
import { getCompilerVersions } from "./getCompilerVersions";
import * as os from "os";

// get versions
const versions = getCompilerVersions();

// setup
const project = new Project({
    manipulationSettings: {
        newLineKind: os.EOL === "\n" ? NewLineKind.LineFeed : NewLineKind.CarriageReturnLineFeed
    }
});

// update compiler types file
const compilerVersionsFile = project.addExistingSourceFile("./src/compiler/compilerVersions.ts");
compilerVersionsFile.removeText();

compilerVersionsFile.addStatements([{
    kind: StructureKind.ImportDeclaration,
    namedImports: ["Node", "CompilerApi"],
    moduleSpecifier: "./CompilerApi"
}, {
    kind: StructureKind.TypeAlias,
    isExported: true,
    name: "CompilerVersions",
    type: versions.map(v => `"${v.version}"`).join(" | ")
}, {
    kind: StructureKind.TypeAlias,
    isExported: true,
    name: "CompilerPackageNames",
    type: versions.map(v => `"${v.name}"`).join(" | ")
}]);

compilerVersionsFile
    .addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: "compilerVersionCollection", initializer: "[]", type: "{ version: CompilerVersions; packageName: CompilerPackageNames; }[]" }]
    })
    .getDeclarations()[0]
    .getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
    .addElements(versions.map(v => `{ version: "${v.version}", packageName: "${v.name}" }`), { useNewLines: true });

compilerVersionsFile.addFunctions([{
    isExported: true,
    isAsync: true,
    name: "importCompilerApi",
    parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
    statements: writer => {
        writer.writeLine("// these explicit import statements are required to get webpack to include these modules");
        writer.write("switch (packageName)").block(() => {
            for (const version of versions) {
                writer.writeLine(`case "${version.name}":`);
                writer.indentBlock(() => {
                    writer.writeLine(`return await import("${version.name}");`);
                });
            }
            writer.writeLine(`default:`);
            writer.indentBlock(() => {
                writer.writeLine("const assertNever: never = packageName;")
                    .writeLine("throw new Error(`Not implemented version: ${packageName}`);");
            });
        });
    }
}, {
    isExported: true,
    isAsync: true,
    name: "importLibFiles",
    parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
    statements: writer => {
        writer.writeLine("// these explicit import statements are required to get webpack to include these modules");
        writer.write("switch (packageName)").block(() => {
            for (const version of versions) {
                writer.writeLine(`case "${version.name}":`);
                writer.indentBlock(() => {
                    writer.writeLine(`return await import("../resources/libFiles/${version.name}/index");`);
                });
            }
            writer.writeLine(`default:`);
            writer.indentBlock(() => {
                writer.writeLine("const assertNever: never = packageName;")
                    .writeLine("throw new Error(`Not implemented version: ${packageName}`);");
            });
        });
    }
}, {
    isExported: true,
    isAsync: true,
    name: "getGenerateFactoryCodeFunction",
    parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
    returnType: "Promise<(ts: CompilerApi, node: Node) => string>",
    statements: writer => {
        writer.writeLine("// these explicit import statements are required to get webpack to include these modules");
        writer.write("switch (packageName)").block(() => {
            for (const version of versions) {
                writer.writeLine(`case "${version.name}":`);
                writer.indentBlock(() => {
                    writer.writeLine(`return (await import("../resources/factoryCode/${version.name}")).generateFactoryCode as any;`);
                });
            }
            writer.writeLine(`default:`);
            writer.indentBlock(() => {
                writer.writeLine("const assertNever: never = packageName;")
                    .writeLine("throw new Error(`Not implemented version: ${packageName}`);");
            });
        });
    }
}]);
compilerVersionsFile.insertText(0, writer => {
    writer.writeLine("/* tslint:disable */").writeLine("/* Automatically maintained from package.json. Do not edit! */").newLine();
});

compilerVersionsFile.save();
