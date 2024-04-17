/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
import { globSync } from "glob";
import * as fs from "node:fs";
import { CodeBlockWriter } from "ts-morph";
import { TsAnalyzer } from "./analyzers/index.js";
import { getCompilerVersions } from "./getCompilerVersions.js";

const versions = getCompilerVersions();
const publicApiInfoDir = "./src/resources/publicApiInfo/";

const filesToDelete = globSync(`${publicApiInfoDir}/*.ts`);
for (const filePath of filesToDelete) {
  fs.unlinkSync(filePath);
}

for (const version of versions) {
  const code = getCode(version.name);
  const newFilePath = publicApiInfoDir + `${version.name}.generated.ts`;
  fs.writeFileSync(newFilePath, code);
}

function getCode(versionName: string) {
  const analyzer = new TsAnalyzer(versionName);
  const writer = new CodeBlockWriter();

  // node properties
  writer.writeLine("export const nodePropertiesBySyntaxKind = new Map([");
  writer.indent(() => {
    for (const [syntaxKindName, properties] of analyzer.getNodePropertiesBySyntaxKind()) {
      writer.write(`["${syntaxKindName}", new Set([`);
      for (const prop of properties) {
        writer.quote(prop).write(",");
      }
      writer.write("])],").newLine();
    }
  });
  writer.writeLine("]);").newLine();

  // others
  writeForProperties("symbolProperties", analyzer.getSymbolProperties());
  writeForProperties("typeProperties", analyzer.getTypeProperties());
  writeForProperties("signatureProperties", analyzer.getSignatureProperties());

  return writer.toString();

  function writeForProperties(name: string, properties: Set<string>) {
    writer.writeLine(`export const ${name} = new Set([`);
    for (const prop of properties) {
      writer.quote(prop).write(",");
    }
    writer.writeLine("])");
  }
}
