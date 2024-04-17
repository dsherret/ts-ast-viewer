/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
import { createMinifier } from "@david/dts-minify";
import { globSync } from "glob";
import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";
import { getCompilerVersions } from "./getCompilerVersions.js";

const versions = getCompilerVersions();
const minifier = createMinifier(ts);

const filesToDelete = globSync("./src/resources/libFiles/**/*.ts");
for (const filePath of filesToDelete) {
  fs.unlinkSync(filePath);
}

const libFilesDir = "./src/resources/libFiles/";
for (const version of versions) {
  const filePaths = globSync(`./node_modules/${version.name}/lib/lib*.d.ts`);
  filePaths.sort();
  const libVersionDir = libFilesDir + version.name + "/";
  if (!fs.existsSync(libVersionDir)) {
    fs.mkdirSync(libVersionDir);
  }

  for (const filePath of filePaths) {
    const newFilePath = libVersionDir + path.basename(filePath, ".d.ts") + ".ts";
    const fileText = fs.readFileSync(filePath).toString("utf8");
    fs.writeFileSync(
      newFilePath,
      `const fileData = {\n` +
        `    fileName: \`/${path.basename(filePath)}\`,\n` +
        `    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)\n` +
        `    text: \"${minifier.minify(fileText).replace(/\r?\n/g, "\\n").replace(/"/g, '\\"')}\"\n` +
        `};\n\n` +
        `export default fileData;`,
      { encoding: "utf8" },
    );
  }

  fs.writeFileSync(
    libVersionDir + "index.ts",
    filePaths
      .map((p) => path.basename(p, ".d.ts"))
      .map((p, i) => "export { default as export" + i + ' } from "./' + p + '.js";').join("\n") + "\n",
    { encoding: "utf8" },
  );
}
