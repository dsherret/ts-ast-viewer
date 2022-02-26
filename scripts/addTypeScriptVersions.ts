import * as cp from "child_process";
import * as path from "path";
import * as semver from "semver";

const versions = getTypeScriptVersionsToInstall();

for (const version of versions) {
  yarnInstallTypeScriptVersion(version);
}
yarnInstallTypeScriptVersion("next");

function yarnInstallTypeScriptVersion(version: string) {
  console.log(`Installing Typescript ${version}...`);
  const command = `yarn add typescript-${version}@npm:typescript@${version}`;
  cp.execSync(command, {
    encoding: "utf8",
    cwd: path.resolve(__dirname, "../site"),
    stdio: "inherit",
  });
}

function getTypeScriptVersionsToInstall() {
  const versions = getAllTypeScriptVersions();
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
  // select the most recent 10 versions
  return finalVersions.slice(-10).map(v => v.format());
}

function getAllTypeScriptVersions() {
  const text = cp.execSync("npm show typescript time --json", { encoding: "utf8" });
  // { "x.x.x": "time", ... }
  const versions = Object.keys(JSON.parse(text));
  return semver.sort(versions.filter(v => semver.valid(v)));
}
