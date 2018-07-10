import { CompilerApi, TypeFlags } from "../compiler";

export function getEnumFlagNames(enumObj: any, flags: number) {
    const allFlags = Object.keys(enumObj).map(k => enumObj[k]).filter(v => typeof v === "number") as number[];

    return allFlags
        .filter(f => (f & flags) !== 0)
        .map(f => enumObj[f]);
}