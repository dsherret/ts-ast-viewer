/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
import * as glob from "glob";
import * as fs from "fs";
import { generateCode } from "ts-factory-code-generator-generator";
import { getCompilerVersions } from "./getCompilerVersions";

const versions = getCompilerVersions();
const factoryCodeDir = "./src/resources/factoryCode/";

glob(`${factoryCodeDir}/*.ts`, (err, filesToDelete) => {
    for (const filePath of filesToDelete)
        fs.unlinkSync(filePath);

    for (const version of versions) {
        const code = generateCode(version.name);
        const newFilePath = factoryCodeDir + `${version.name}.ts`;
        fs.writeFileSync(newFilePath, `${code.replace(/\r?\n/g, "\n")}`);
    }
});
