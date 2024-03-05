/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
import { globSync } from "glob";
import * as fs from "node:fs";
import { generateCode } from "ts-factory-code-generator-generator";
import { getCompilerVersions } from "./getCompilerVersions.js";

const versions = getCompilerVersions();
const factoryCodeDir = "./src/resources/factoryCode/";

const filesToDelete = globSync(`${factoryCodeDir}/*.ts`);
for (const filePath of filesToDelete) {
  fs.unlinkSync(filePath);
}

for (const version of versions) {
  const code = generateCode(version.name);
  const newFilePath = factoryCodeDir + `${version.name}.generated.ts`;
  fs.writeFileSync(newFilePath, `${code.replace(/\r?\n/g, "\n")}`);
}
