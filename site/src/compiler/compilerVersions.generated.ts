// dprint-ignore-file
/* Automatically maintained from package.json. Do not edit! */

import { CompilerPackageNames, CompilerVersions } from "@ts-ast-viewer/shared";
import { Node, CompilerApi } from "./CompilerApi";
import { assertNever } from "../utils";

export async function importCompilerApi(packageName: CompilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.4.2":
            return await import("typescript-4.4.2");
        case "typescript-4.3.5":
            return await import("typescript-4.3.5");
        case "typescript-4.2.4":
            return await import("typescript-4.2.4");
        case "typescript-4.1.5":
            return await import("typescript-4.1.5");
        case "typescript-4.0.5":
            return await import("typescript-4.0.5");
        case "typescript-3.9.7":
            return await import("typescript-3.9.7");
        case "typescript-3.8.3":
            return await import("typescript-3.8.3");
        case "typescript-3.7.5":
            return await import("typescript-3.7.5");
        case "typescript-3.6.4":
            return await import("typescript-3.6.4");
        case "typescript-3.5.3":
            return await import("typescript-3.5.3");
        case "typescript-3.4.5":
            return await import("typescript-3.4.5");
        case "typescript-3.3.3":
            return await import("typescript-3.3.3");
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}

export async function importLibFiles(packageName: CompilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.4.2":
            return await import("../resources/libFiles/typescript-4.4.2/index");
        case "typescript-4.3.5":
            return await import("../resources/libFiles/typescript-4.3.5/index");
        case "typescript-4.2.4":
            return await import("../resources/libFiles/typescript-4.2.4/index");
        case "typescript-4.1.5":
            return await import("../resources/libFiles/typescript-4.1.5/index");
        case "typescript-4.0.5":
            return await import("../resources/libFiles/typescript-4.0.5/index");
        case "typescript-3.9.7":
            return await import("../resources/libFiles/typescript-3.9.7/index");
        case "typescript-3.8.3":
            return await import("../resources/libFiles/typescript-3.8.3/index");
        case "typescript-3.7.5":
            return await import("../resources/libFiles/typescript-3.7.5/index");
        case "typescript-3.6.4":
            return await import("../resources/libFiles/typescript-3.6.4/index");
        case "typescript-3.5.3":
            return await import("../resources/libFiles/typescript-3.5.3/index");
        case "typescript-3.4.5":
            return await import("../resources/libFiles/typescript-3.4.5/index");
        case "typescript-3.3.3":
            return await import("../resources/libFiles/typescript-3.3.3/index");
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}

export type FactoryCodeGenerator = (ts: CompilerApi, node: Node) => string;

export async function getGenerateFactoryCodeFunction(packageName: CompilerPackageNames): Promise<FactoryCodeGenerator> {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.4.2":
            return (await import("../resources/factoryCode/typescript-4.4.2")).generateFactoryCode as any;
        case "typescript-4.3.5":
            return (await import("../resources/factoryCode/typescript-4.3.5")).generateFactoryCode as any;
        case "typescript-4.2.4":
            return (await import("../resources/factoryCode/typescript-4.2.4")).generateFactoryCode as any;
        case "typescript-4.1.5":
            return (await import("../resources/factoryCode/typescript-4.1.5")).generateFactoryCode as any;
        case "typescript-4.0.5":
            return (await import("../resources/factoryCode/typescript-4.0.5")).generateFactoryCode as any;
        case "typescript-3.9.7":
            return (await import("../resources/factoryCode/typescript-3.9.7")).generateFactoryCode as any;
        case "typescript-3.8.3":
            return (await import("../resources/factoryCode/typescript-3.8.3")).generateFactoryCode as any;
        case "typescript-3.7.5":
            return (await import("../resources/factoryCode/typescript-3.7.5")).generateFactoryCode as any;
        case "typescript-3.6.4":
            return (await import("../resources/factoryCode/typescript-3.6.4")).generateFactoryCode as any;
        case "typescript-3.5.3":
            return (await import("../resources/factoryCode/typescript-3.5.3")).generateFactoryCode as any;
        case "typescript-3.4.5":
            return (await import("../resources/factoryCode/typescript-3.4.5")).generateFactoryCode as any;
        case "typescript-3.3.3":
            return (await import("../resources/factoryCode/typescript-3.3.3")).generateFactoryCode as any;
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}

export interface PublicApiInfo {
    nodePropertiesBySyntaxKind: Map<string, Set<string>>;
    symbolProperties: Set<string>;
    typeProperties: Set<string>;
    signatureProperties: Set<string>;
}

export async function getPublicApiInfo(packageName: CompilerPackageNames): Promise<PublicApiInfo> {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.4.2":
            return (await import("../resources/publicApiInfo/typescript-4.4.2"));
        case "typescript-4.3.5":
            return (await import("../resources/publicApiInfo/typescript-4.3.5"));
        case "typescript-4.2.4":
            return (await import("../resources/publicApiInfo/typescript-4.2.4"));
        case "typescript-4.1.5":
            return (await import("../resources/publicApiInfo/typescript-4.1.5"));
        case "typescript-4.0.5":
            return (await import("../resources/publicApiInfo/typescript-4.0.5"));
        case "typescript-3.9.7":
            return (await import("../resources/publicApiInfo/typescript-3.9.7"));
        case "typescript-3.8.3":
            return (await import("../resources/publicApiInfo/typescript-3.8.3"));
        case "typescript-3.7.5":
            return (await import("../resources/publicApiInfo/typescript-3.7.5"));
        case "typescript-3.6.4":
            return (await import("../resources/publicApiInfo/typescript-3.6.4"));
        case "typescript-3.5.3":
            return (await import("../resources/publicApiInfo/typescript-3.5.3"));
        case "typescript-3.4.5":
            return (await import("../resources/publicApiInfo/typescript-3.4.5"));
        case "typescript-3.3.3":
            return (await import("../resources/publicApiInfo/typescript-3.3.3"));
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}
