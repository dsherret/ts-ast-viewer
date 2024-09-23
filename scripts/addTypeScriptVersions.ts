import $ from "@david/dax";
import * as semver from "@std/semver";
import * as path from "node:path";

const versions = await getTypeScriptVersionsToInstall();

for (const version of versions) {
  await npmInstallTypeScriptVersion(version);
}
await npmInstallTypeScriptVersion("next");

async function npmInstallTypeScriptVersion(version: string) {
  console.log(`Installing Typescript ${version}...`);
  await $`deno install typescript-${version}@npm:typescript@${version}`
    .cwd(path.resolve(import.meta.dirname!, "../"));
}

async function getTypeScriptVersionsToInstall() {
  const versions = await getAllTypeScriptVersions();
  const highestMinors: { [minor: string]: semver.SemVer } = {};
  // get the highest version for each minor
  for (const version of versions) {
    if (
      version == null ||
      (version.prerelease?.length ?? 0) > 0 ||
      (version.build?.length ?? 0) > 0
    ) {
      continue;
    }
    const majorMinor = version.major + "." + version.minor;
    if (highestMinors[majorMinor] == null || semver.compare(highestMinors[majorMinor], version) < 0) {
      highestMinors[majorMinor] = version;
    }
  }
  const finalVersions = Object.values(highestMinors).sort(semver.compare);
  // select the most recent 9 versions
  return finalVersions.slice(-9).map((v) => semver.format(v));
}

async function getAllTypeScriptVersions() {
  // { "x.x.x": "time", ... }
  const data = await $`npm show typescript time --json`.json();
  const versions = Object.keys(data);
  return versions.filter((v) => semver.canParse(v)).map((v) => semver.parse(v)).sort(semver.compare);
}
