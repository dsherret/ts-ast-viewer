/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
import * as glob from "glob";
import * as fs from "fs";
import * as os from "os";
import { generateCode } from "ts-factory-code-generator-generator";
import { getCompilerVersions } from "./getCompilerVersions";

const versions = getCompilerVersions();

glob("./src/resources/factoryCode/*.ts", (err, filesToDelete) => {
    for (const filePath of filesToDelete)
        fs.unlinkSync(filePath);

    const factoryCodeDir = "./src/resources/factoryCode/";
    for (const version of versions) {
        const code = generateCode(version.name);
        const newFilePath = factoryCodeDir + `${version.name}.ts`;
        fs.writeFileSync(newFilePath, `${code.replace(/\r?\n/g, os.EOL)}`);
    }
});
