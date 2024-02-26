import { ArrayUtils } from "./ArrayUtils";
import { EnumUtils } from "./EnumUtils";

export function getEnumFlagLines(enumObj: any, value: number): string[] | null {
  const names = EnumUtils.getNamesForValues(enumObj).filter(entry => entry.value & value);
  if (names.length === 0) {
    return null;
  }

  const [powersOfTwo, others] = ArrayUtils.partition(names, ({ value }) => Number.isInteger(Math.log2(value)));

  return [...powersOfTwo, ...others].flatMap(({ value, names }) => {
    const power = Math.log2(value);
    return names.map(name => Number.isInteger(power) ? `${name} (2 ^ ${power})` : name);
  });
}
