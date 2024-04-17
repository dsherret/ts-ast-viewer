import * as fs from "node:fs";

export function getCompilerVersions() {
  const fileData = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  const dependencies = fileData["dependencies"];
  const keyRegEx = /^typescript(-[0-9]+\.[0-9]+\.[0-9]+)$/;
  const versionRegEx = /[0-9]+\.[0-9]+\.[0-9]+/;
  const versions: { version: string; name: string }[] = [];

  for (const key of Object.keys(dependencies)) {
    if (key === "typescript-next") {
      const tsNextInfo = JSON.parse(fs.readFileSync("./node_modules/typescript-next/package.json", "utf-8"));
      versions.push({ version: `@next (${tsNextInfo.version})`, name: key });
      continue;
    }

    if (!keyRegEx.test(key)) {
      continue;
    }
    const matches = versionRegEx.exec(dependencies[key])!;
    versions.push({ version: matches[0], name: key });
  }

  // this means that it's for local development... just use the the dev dependency
  if (versions.length === 0) {
    const devDependencies = fileData["devDependencies"];
    versions.push({
      name: `typescript`,
      version: devDependencies["typescript"],
    });
  }

  return versions.sort((a, b) => {
    if (a.version.startsWith("@next")) {
      return 1;
    }
    if (b.version.startsWith("@next")) {
      return -1;
    }
    return a.version > b.version ? -1 : 1;
  });
}
