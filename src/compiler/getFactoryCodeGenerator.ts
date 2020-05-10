import { CompilerPackageNames, getGenerateFactoryCodeFunction, FactoryCodeGenerator } from "./compilerVersions";

const cache: { [packageName: string]: Promise<FactoryCodeGenerator> } = {};
const hasLoadedVersion: { [packageName: string]: true } = {};

export function getFactoryCodeGenerator(packageName: CompilerPackageNames): Promise<FactoryCodeGenerator> {
    if (cache[packageName] == null) {
        cache[packageName] = getGenerateFactoryCodeFunction(packageName);
        cache[packageName].catch(() => delete cache[packageName]);
        cache[packageName].then(() => hasLoadedVersion[packageName] = true);
    }
    return cache[packageName];
}
