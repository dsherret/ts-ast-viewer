import * as fs from "fs";

export function getCompilerVersions() {
    const fileData = JSON.parse(fs.readFileSync("./package.json"));
    const dependencies = fileData["dependencies"];
    const keyRegEx = /^typescript(-[0-9]+\.[0-9]+\.[0-9]+)?$/;
    const versionRegEx = /[0-9]+\.[0-9]+\.[0-9]+/;
    const versions: { version: string; name: string; }[] = [];

    for (const key of Object.keys(dependencies)) {
        if (key === "typescript-next") {
            versions.push({ version: "@next", name: key });
            continue;
        }

        if (!keyRegEx.test(key))
            continue;
        const matches = versionRegEx.exec(dependencies[key]);
        versions.push({ version: matches[0], name: key });
    }

    return versions.sort((a, b) => {
        if (a.version === "@next")
            return 1;
        if (b.version === "@next")
            return -1;
        return a.version > b.version ? -1 : 1
    });
}
