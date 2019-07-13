/* Automatically maintained from package.json. Do not edit! */
import { CompilerApi, Node } from "./CompilerApi";
import { CompilerPackageNames, getGenerateFactoryCodeFunction } from "./compilerVersions";

export type FactoryCodeGenerator = (ts: CompilerApi, node: Node) => string;

const cache: { [packageName: string]: Promise<FactoryCodeGenerator>; } = {};
const hasLoadedVersion: { [packageName: string]: true; } = {};

export function getFactoryCodeGenerator(packageName: CompilerPackageNames): Promise<FactoryCodeGenerator> {
    if (cache[packageName] == null) {
        cache[packageName] = getGenerateFactoryCodeFunction(packageName);
        cache[packageName].catch(() => delete cache[packageName]);
        cache[packageName].then(() => hasLoadedVersion[packageName] = true);
    }
    return cache[packageName];
}

export function hasLoadedFactoryCode(packageName: CompilerPackageNames) {
    return hasLoadedVersion[packageName] === true;
}
