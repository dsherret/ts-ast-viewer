/* tslint:disable */
/* Automatically maintained from package.json. Do not edit! */

export type compilerVersions = "3.5.3" | "3.4.5" | "3.3.3" | "3.2.4" | "3.1.6" | "3.0.3" | "2.9.2" | "2.8.4" | "2.7.2" | "2.6.2";
export type compilerPackageNames = "typescript" | "typescript-3.4.5" | "typescript-3.3.3" | "typescript-3.2.4" | "typescript-3.1.6" | "typescript-3.0.3" | "typescript-2.9.2" | "typescript-2.8.4" | "typescript-2.7.2" | "typescript-2.6.2";

export const compilerVersionCollection: { version: compilerVersions; packageName: compilerPackageNames; }[] = [
    { version: "3.5.3", packageName: "typescript" },
    { version: "3.4.5", packageName: "typescript-3.4.5" },
    { version: "3.3.3", packageName: "typescript-3.3.3" },
    { version: "3.2.4", packageName: "typescript-3.2.4" },
    { version: "3.1.6", packageName: "typescript-3.1.6" },
    { version: "3.0.3", packageName: "typescript-3.0.3" },
    { version: "2.9.2", packageName: "typescript-2.9.2" },
    { version: "2.8.4", packageName: "typescript-2.8.4" },
    { version: "2.7.2", packageName: "typescript-2.7.2" },
    { version: "2.6.2", packageName: "typescript-2.6.2" }
];

export async function importCompilerApi(packageName: compilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript":
            return await import("typescript");
        case "typescript-3.4.5":
            return await import("typescript-3.4.5");
        case "typescript-3.3.3":
            return await import("typescript-3.3.3");
        case "typescript-3.2.4":
            return await import("typescript-3.2.4");
        case "typescript-3.1.6":
            return await import("typescript-3.1.6");
        case "typescript-3.0.3":
            return await import("typescript-3.0.3");
        case "typescript-2.9.2":
            return await import("typescript-2.9.2");
        case "typescript-2.8.4":
            return await import("typescript-2.8.4");
        case "typescript-2.7.2":
            return await import("typescript-2.7.2");
        case "typescript-2.6.2":
            return await import("typescript-2.6.2");
        default:
            const assertNever: never = packageName;
            throw new Error(`Not implemented version: ${packageName}`);
    }
}

export async function immportLibFiles(packageName: compilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript":
            return await import("../resources/libFiles/typescript/index");
        case "typescript-3.4.5":
            return await import("../resources/libFiles/typescript-3.4.5/index");
        case "typescript-3.3.3":
            return await import("../resources/libFiles/typescript-3.3.3/index");
        case "typescript-3.2.4":
            return await import("../resources/libFiles/typescript-3.2.4/index");
        case "typescript-3.1.6":
            return await import("../resources/libFiles/typescript-3.1.6/index");
        case "typescript-3.0.3":
            return await import("../resources/libFiles/typescript-3.0.3/index");
        case "typescript-2.9.2":
            return await import("../resources/libFiles/typescript-2.9.2/index");
        case "typescript-2.8.4":
            return await import("../resources/libFiles/typescript-2.8.4/index");
        case "typescript-2.7.2":
            return await import("../resources/libFiles/typescript-2.7.2/index");
        case "typescript-2.6.2":
            return await import("../resources/libFiles/typescript-2.6.2/index");
        default:
            const assertNever: never = packageName;
            throw new Error(`Not implemented version: ${packageName}`);
    }
}
