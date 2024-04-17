import { partition } from "./arrayUtils.js";

export function getNames(e: any) {
  return Object.keys(e)
    .filter((k) => typeof e[k] === "number") as string[];
}

export function getValues<T extends number>(e: any) {
  return Object.keys(e)
    .map((k) => e[k])
    .filter((v) => typeof v === "number") as T[];
}

export function getNamesForValues(e: any) {
  const values: { [value: number]: string[] } = {};

  for (const name of getNames(e)) {
    const value = e[name];
    if (values[value] == null) {
      values[value] = [];
    }
    values[value].push(name);
  }

  return Object.keys(values).map((key) => ({
    value: parseInt(key, 10),
    names: (values as any)[key] as string[],
  }));
}

export function getEnumFlagLines(enumObj: any, value: number): string[] | null {
  const names = getNamesForValues(enumObj).filter((entry) => entry.value & value);
  if (names.length === 0) {
    return null;
  }

  const [powersOfTwo, others] = partition(names, ({ value }) => Number.isInteger(Math.log2(value)));

  return [...powersOfTwo, ...others].flatMap(({ value, names }) => {
    const power = Math.log2(value);
    return names.map((name) => Number.isInteger(power) ? `${name} (2 ^ ${power})` : name);
  });
}
