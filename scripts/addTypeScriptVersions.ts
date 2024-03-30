import $ from "@david/dax";
import * as path from "node:path";
import * as semver from "semver";

const versions = await getTypeScriptVersionsToInstall();

for (const version of versions) {
  await npmInstallTypeScriptVersion(version);
}
await npmInstallTypeScriptVersion("next");

async function npmInstallTypeScriptVersion(version: string) {
  console.log(`Installing Typescript ${version}...`);
  await $`npm add typescript-${version}@npm:typescript@${version}`
    .cwd(path.resolve(import.meta.dirname, "../"));
}

async function getTypeScriptVersionsToInstall() {
  const versions = await getAllTypeScriptVersions();
  const highestMinors: { [minor: string]: semver.SemVer } = {};
  // get the highest version for each minor
  for (const strVersion of versions) {
    const version = semver.parse(strVersion);
    if (
      version == null
      || version.prerelease.length > 0
      || version.build.length > 0
    ) {
      continue;
    }
    const majorMinor = version.major + "." + version.minor;
    if (highestMinors[majorMinor] == null || highestMinors[majorMinor].compare(version) < 0) {
      highestMinors[majorMinor] = version;
    }
  }
  const finalVersions = semver.sort(Object.values(highestMinors));
  // select the most recent 9 versions
  return finalVersions.slice(-9).map(v => v.format());
}

async function getAllTypeScriptVersions() {
  // { "x.x.x": "time", ... }
  const data = await $`npm show typescript time --json`.json();
  const versions = Object.keys(data);
  return semver.sort(versions.filter(v => semver.valid(v)));
}
