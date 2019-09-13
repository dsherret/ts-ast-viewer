/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { getCompilerVersions } from "./getCompilerVersions";

const versions = getCompilerVersions();

glob("./src/resources/libFiles/**/*.ts", (err, filesToDelete) => {
    for (const filePath of filesToDelete)
        fs.unlinkSync(filePath);

    const libFilesDir = "./src/resources/libFiles/";
    for (const version of versions) {
        glob(`./node_modules/${version.name}/lib/lib*.d.ts`, (err, filePaths) => {
            const libVersionDir = libFilesDir + version.name + "/";
            if (!fs.existsSync(libVersionDir))
                fs.mkdirSync(libVersionDir);

            for (const filePath of filePaths) {
                const newFilePath = libVersionDir + path.basename(filePath, ".d.ts") + ".ts";
                const fileText = fs.readFileSync(filePath).toString().replace(/\`/g, "\\`");
                fs.writeFileSync(newFilePath, `export default {${os.EOL}`
                    + `    fileName: \`/${path.basename(filePath)}\`,${os.EOL}`
                    + `    text: \`${fileText.replace(/\r?\n/g, os.EOL)}\`${os.EOL}`
                    + `};`);
            }

            fs.writeFileSync(
                libVersionDir + "index.ts",
                filePaths
                    .map(p => path.basename(p, ".d.ts"))
                    .map((p, i) => "export { default as export" + i + " } from \"./" + p + "\";").join(os.EOL) + os.EOL
            );
        });
    }
});
