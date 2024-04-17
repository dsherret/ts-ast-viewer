import { Project, StructureKind, VariableDeclarationKind } from "ts-morph";
import { getCompilerVersions } from "./getCompilerVersions.js";

// get versions
const versions = getCompilerVersions();

// setup
const project = new Project();

// update shared compiler versions file
const compilerVersionsFile = project.addSourceFileAtPath(
  "./src/compiler/compilerVersions.generated.ts",
);
compilerVersionsFile.removeText();

compilerVersionsFile.addStatements([(writer) => {
  writer.writeLine("// deno-fmt-ignore-file")
    .writeLine("/* Automatically maintained from package.json. Do not edit! */")
    .blankLine();
}, {
  kind: StructureKind.TypeAlias,
  isExported: true,
  name: "CompilerPackageNames",
  type: versions.map((v) => `"${v.name}"`).join(" | "),
}, {
  kind: StructureKind.TypeAlias,
  isExported: true,
  name: "CompilerVersions",
  type: versions.map((v) => `"${v.version}"`).join(" | "),
}, {
  kind: StructureKind.VariableStatement,
  isExported: true,
  declarationKind: VariableDeclarationKind.Const,
  declarations: [{
    name: "compilerVersionCollection",
    initializer: (writer) => {
      writer.write("[").newLine();
      writer.indent(() => {
        for (let i = 0; i < versions.length; i++) {
          const version = versions[i];
          writer.write(
            `{ version: "${version.version}", packageName: "${version.name}" }`,
          );
          if (i < versions.length - 1) {
            writer.write(",");
          }
          writer.newLine();
        }
      });
      writer.write("]");
    },
    type: "{ version: CompilerVersions; packageName: CompilerPackageNames; }[]",
  }],
}]);
compilerVersionsFile.saveSync();

// update compiler types file
const compilerTypesFile = project.addSourceFileAtPath(
  "./src/compiler/compiler.generated.ts",
);
compilerTypesFile.removeText();

compilerTypesFile.addStatements([(writer) => {
  writer.writeLine("// deno-fmt-ignore-file")
    .writeLine("/* Automatically maintained from package.json. Do not edit! */")
    .blankLine();
}, {
  kind: StructureKind.ImportDeclaration,
  namedImports: ["CompilerPackageNames", "CompilerVersions"],
  moduleSpecifier: "./compilerVersions.generated.js",
}, {
  kind: StructureKind.ImportDeclaration,
  namedImports: ["Node", "CompilerApi"],
  moduleSpecifier: "./CompilerApi.js",
}, {
  kind: StructureKind.ImportDeclaration,
  namedImports: ["assertNever"],
  moduleSpecifier: "../utils/index.js",
}, {
  kind: StructureKind.Function,
  isExported: true,
  isAsync: true,
  name: "importCompilerApi",
  parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
  statements: (writer) => {
    writer.writeLine(
      "// these explicit import statements are required to get webpack to include these modules",
    );
    writer.write("switch (packageName)").block(() => {
      for (const version of versions) {
        writer.writeLine(`case "${version.name}":`);
        writer.indent(() => {
          writer.writeLine(`return await import("${version.name}");`);
        });
      }
      writer.writeLine(`default:`);
      writer.indent(() => {
        writer.writeLine(
          "return assertNever(packageName, `Not implemented version: ${packageName}`);",
        );
      });
    });
  },
}, {
  kind: StructureKind.Function,
  isExported: true,
  isAsync: true,
  name: "importLibFiles",
  parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
  statements: (writer) => {
    writer.writeLine(
      "// these explicit import statements are required to get webpack to include these modules",
    );
    writer.write("switch (packageName)").block(() => {
      for (const version of versions) {
        writer.writeLine(`case "${version.name}":`);
        writer.indent(() => {
          writer.writeLine(
            `return await import("../resources/libFiles/${version.name}/index.js");`,
          );
        });
      }
      writer.writeLine(`default:`);
      writer.indent(() => {
        writer.writeLine(
          "return assertNever(packageName, `Not implemented version: ${packageName}`);",
        );
      });
    });
  },
}, {
  kind: StructureKind.TypeAlias,
  isExported: true,
  name: "FactoryCodeGenerator",
  type: "(ts: CompilerApi, node: Node) => string",
}, {
  kind: StructureKind.Function,
  isExported: true,
  isAsync: true,
  name: "getGenerateFactoryCodeFunction",
  parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
  returnType: "Promise<FactoryCodeGenerator>",
  statements: (writer) => {
    writer.writeLine(
      "// these explicit import statements are required to get webpack to include these modules",
    );
    writer.write("switch (packageName)").block(() => {
      for (const version of versions) {
        writer.writeLine(`case "${version.name}":`);
        writer.indent(() => {
          writer.writeLine(
            `return (await import("../resources/factoryCode/${version.name}.generated.js")).generateFactoryCode as any;`,
          );
        });
      }
      writer.writeLine(`default:`);
      writer.indent(() => {
        writer.writeLine(
          "return assertNever(packageName, `Not implemented version: ${packageName}`);",
        );
      });
    });
  },
}, {
  kind: StructureKind.Interface,
  isExported: true,
  name: "PublicApiInfo",
  properties: [{
    name: "nodePropertiesBySyntaxKind",
    type: "Map<string, Set<string>>",
  }, {
    name: "symbolProperties",
    type: "Set<string>",
  }, {
    name: "typeProperties",
    type: "Set<string>",
  }, {
    name: "signatureProperties",
    type: "Set<string>",
  }],
}, {
  kind: StructureKind.Function,
  isExported: true,
  isAsync: true,
  name: "getPublicApiInfo",
  returnType: "Promise<PublicApiInfo>",
  parameters: [{ name: "packageName", type: "CompilerPackageNames" }],
  statements: (writer) => {
    writer.writeLine(
      "// these explicit import statements are required to get webpack to include these modules",
    );
    writer.write("switch (packageName)").block(() => {
      for (const version of versions) {
        writer.writeLine(`case "${version.name}":`);
        writer.indent(() => {
          writer.writeLine(
            `return (await import("../resources/publicApiInfo/${version.name}.generated.js"));`,
          );
        });
      }
      writer.writeLine(`default:`);
      writer.indent(() => {
        writer.writeLine(
          "return assertNever(packageName, `Not implemented version: ${packageName}`);",
        );
      });
    });
  },
}]);

compilerTypesFile.saveSync();
