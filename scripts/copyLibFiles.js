/* Copies the lib.d.ts files from node_modules into the src directory of the library for easy access */
var glob = require("glob");
var fs = require("fs");
var path = require("path");

glob("./src/resources/libFiles/*.ts", (err, filesToDelete) => {
    for (const filePath of filesToDelete)
        fs.unlinkSync(filePath);

    glob("./node_modules/typescript/lib/lib*.d.ts", (err, filePaths) => {
        for (const filePath of filePaths) {
            const newFilePath = "./src/resources/libFiles/" + path.basename(filePath, ".d.ts") + ".ts";
            const fileText = fs.readFileSync(filePath).toString().replace(/\`/g, "\\`");
            fs.writeFileSync(newFilePath, "export default {\n    fileName: `/" + path.basename(filePath) + "`,\n    text: `" + fileText + "`\n};");
        }

        fs.writeFileSync("./src/resources/libFiles/index.ts",
            filePaths
                .map(p => path.basename(p, ".d.ts"))
                .map((p, i) => "export {default as export" + i + "} from \"./" + p + "\";").join("\n") + "\n");
    });
});