/* Automatically maintained from package.json. Do not edit! */
export type compilerVersions = "2.8.1" | "2.7.2" | "2.6.2" | "2.5.3" | "2.4.2";
export type compilerPackageNames = "typescript" | "typescript-2.7.2" | "typescript-2.6.2" | "typescript-2.5.3" | "typescript-2.4.2";

export const compilerVersionCollection: { version: compilerVersions; packageName: compilerPackageNames; }[] = [
    { version: "2.8.1", packageName: "typescript" },
    { version: "2.7.2", packageName: "typescript-2.7.2" },
    { version: "2.6.2", packageName: "typescript-2.6.2" },
    { version: "2.5.3", packageName: "typescript-2.5.3" },
    { version: "2.4.2", packageName: "typescript-2.4.2" }
];

export async function importCompilerApi(packageName: compilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript":
            return await import("typescript");
        case "typescript-2.7.2":
            return await import("typescript-2.7.2");
        case "typescript-2.6.2":
            return await import("typescript-2.6.2");
        case "typescript-2.5.3":
            return await import("typescript-2.5.3");
        case "typescript-2.4.2":
            return await import("typescript-2.4.2");
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
        case "typescript-2.7.2":
            return await import("../resources/libFiles/typescript-2.7.2/index");
        case "typescript-2.6.2":
            return await import("../resources/libFiles/typescript-2.6.2/index");
        case "typescript-2.5.3":
            return await import("../resources/libFiles/typescript-2.5.3/index");
        case "typescript-2.4.2":
            return await import("../resources/libFiles/typescript-2.4.2/index");
        default:
            const assertNever: never = packageName;
            throw new Error(`Not implemented version: ${packageName}`);
    }
}
