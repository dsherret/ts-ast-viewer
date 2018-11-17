export function getEnumFlagNames(enumObj: any, flags: number) {
    const allFlags = Object.keys(enumObj)
        .map(k => enumObj[k]).filter(v => typeof v === "number") as number[];
    const matchedFlags = allFlags.filter(f => (f & flags) !== 0);

    return matchedFlags
        .filter((f, i) => matchedFlags.indexOf(f) === i)
        .map(f => enumObj[f]);
}
