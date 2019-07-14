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

compilerVersionsFile.addStatements([writer => {
    writer.writeLine("/* tslint:disable */")
        .writeLine("/* Automatically maintained from package.json. Do not edit! */")
        .blankLine();
}, {
    kind: StructureKind.ImportDeclaration,
    namedImports: ["Node", "CompilerApi"],
    moduleSpecifier: "./CompilerApi"
}, {
    kind: StructureKind.ImportDeclaration,
    namedImports: ["assertNever"],
    moduleSpecifier: "../utils"
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
}, {
    kind: StructureKind.VariableStatement,
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
        name: "compilerVersionCollection",
        initializer: writer => {
            writer.write("[").newLine();
            writer.indentBlock(() => {
                for (let i = 0; i < versions.length; i++) {
                    const version = versions[i];
                    writer.write(`{ version: "${version.version}", packageName: "${version.name}" }`);
                    if (i < versions.length - 1)
                        writer.write(",");
                    writer.newLine();
                }
            });
            writer.write("]");
        },
        type: "{ version: CompilerVersions; packageName: CompilerPackageNames; }[]"
    }],
}, {
    kind: StructureKind.Function,
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
                writer.writeLine("return assertNever(packageName, `Not implemented version: ${packageName}`);");
            });
        });
    }
}, {
    kind: StructureKind.Function,
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
                writer.writeLine("return assertNever(packageName, `Not implemented version: ${packageName}`);");
            });
        });
    }
}, {
    kind: StructureKind.Function,
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
                writer.writeLine("return assertNever(packageName, `Not implemented version: ${packageName}`);");
            });
        });
    }
}]);

compilerVersionsFile.save();
