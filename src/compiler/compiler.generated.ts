// deno-fmt-ignore-file
/* Automatically maintained from package.json. Do not edit! */

import {
  CompilerPackageNames,
  CompilerVersions,
} from "./compilerVersions.generated.js";
import { CompilerApi, Node } from "./CompilerApi.js";
import { assertNever } from "../utils/index.js";

export async function importCompilerApi(packageName: CompilerPackageNames) {
  // these explicit import statements are required to get webpack to include these modules
  switch (packageName) {
    case "typescript":
      return await import("typescript");
    default:
      return assertNever(
        packageName,
        `Not implemented version: ${packageName}`,
      );
  }
}

export async function importLibFiles(packageName: CompilerPackageNames) {
  // these explicit import statements are required to get webpack to include these modules
  switch (packageName) {
    case "typescript":
      return await import("../resources/libFiles/typescript/index.js");
    default:
      return assertNever(
        packageName,
        `Not implemented version: ${packageName}`,
      );
  }
}

export type FactoryCodeGenerator = (ts: CompilerApi, node: Node) => string;

export async function getGenerateFactoryCodeFunction(
  packageName: CompilerPackageNames,
): Promise<FactoryCodeGenerator> {
  // these explicit import statements are required to get webpack to include these modules
  switch (packageName) {
    case "typescript":
      return (await import("../resources/factoryCode/typescript.generated.js"))
        .generateFactoryCode as any;
    default:
      return assertNever(
        packageName,
        `Not implemented version: ${packageName}`,
      );
  }
}

export interface PublicApiInfo {
  nodePropertiesBySyntaxKind: Map<string, Set<string>>;
  symbolProperties: Set<string>;
  typeProperties: Set<string>;
  signatureProperties: Set<string>;
}

export async function getPublicApiInfo(
  packageName: CompilerPackageNames,
): Promise<PublicApiInfo> {
  // these explicit import statements are required to get webpack to include these modules
  switch (packageName) {
    case "typescript":
      return (await import(
        "../resources/publicApiInfo/typescript.generated.js"
      ));
    default:
      return assertNever(
        packageName,
        `Not implemented version: ${packageName}`,
      );
  }
}
