import $ from "@david/dax";

$.logStep("Checking node_modules/allotment/package.json");
const packageJson = $.path(import.meta.dirname!)
  .join("../node_modules/allotment/package.json");
const value = packageJson.readJsonSync() as any;
if (value.exports["./dist/"] === "./dist/") {
  delete value.exports["./dist/"];
  value.exports["./dist/*"] = "./dist/*";
  packageJson.writeJsonPrettySync(value);
  $.log("Patched");
} else {
  $.log("No changes");
}
