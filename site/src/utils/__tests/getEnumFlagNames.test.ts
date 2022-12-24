import { getEnumFlagNames } from "../getEnumFlagNames";

describe("getEnumFlagNames", () => {
  it("should get the flag names", () => {
    enum TestFlags {
      First = 1 << 0,
      Second = 1 << 1,
      Third = 1 << 2,
      Fourth = 1 << 3,
      All = First | Second | Third | Fourth,
    }

    expect(getEnumFlagNames(TestFlags, 1 << 1)).toEqual([
      "Second (2 ^ 1)",
      "All",
    ]);

    expect(getEnumFlagNames(TestFlags, 1 << 0 | 1 << 1 | 1 << 2)).toEqual([
      "First (2 ^ 0)",
      "Second (2 ^ 1)",
      "Third (2 ^ 2)",
      "All",
    ]);
  });
});
