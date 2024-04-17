import { expect } from "@std/expect";
import * as arrayUtils from "../arrayUtils.js";

Deno.test("arrayUtils#binarySearch", async (t) => {
  function doTest(items: number[], value: number, expectedValue: number) {
    const result = arrayUtils.binarySearch(items, (v) => {
      if (v > value) {
        return -1;
      } else if (v === value) {
        return 0;
      }
      return 1;
    });
    expect(result).toEqual(expectedValue);
  }

  await t.step("should find the value is at the beginning of the array", () => {
    doTest([1, 2, 3, 4], 1, 0);
  });

  await t.step("should find the value is at the end of the array", () => {
    doTest([1, 2, 3, 4], 4, 3);
  });

  await t.step("should find the value right before the middle in an even length array", () => {
    doTest([1, 2, 3, 4], 2, 1);
  });

  await t.step("should find the value right after the middle in an even length array", () => {
    doTest([1, 2, 3, 4], 3, 2);
  });

  await t.step("should find the value right before the middle in an odd length array", () => {
    doTest([1, 2, 3, 4, 5], 2, 1);
  });

  await t.step("should find the value in the middle in an odd length array", () => {
    doTest([1, 2, 3, 4, 5], 3, 2);
  });

  await t.step("should find the value right after the middle in an odd length array", () => {
    doTest([1, 2, 3, 4, 5], 4, 3);
  });

  await t.step("should not find a number in the middle of the array that doesn't exist", () => {
    doTest([1, 2, 4, 5, 6], 3, -1);
  });

  await t.step("should not find a number beyond the left of the array", () => {
    doTest([1, 2, 3, 4, 5], 0, -1);
  });

  await t.step("should not find a number beyond the right of the array", () => {
    doTest([1, 2, 3, 4, 5], 6, -1);
  });
});
