import { expect } from "@std/expect";
import { createLineNumberAndColumns, type LineNumberAndColumn } from "../createLineNumberAndColumns.js";

Deno.test("createLineNumberAndColumns", async (t) => {
  function doTest(text: string, expected: LineNumberAndColumn[]) {
    const result = createLineNumberAndColumns(text);
    expect(result).toEqual(expected);
  }

  await t.step("should get for empty text", () => {
    doTest("", [{ pos: 0, length: 0, number: 1 }]);
  });

  await t.step("should get for a single line", () => {
    doTest("test", [{ pos: 0, length: 4, number: 1 }]);
  });

  await t.step("should get for multiple lines ending without a newline", () => {
    doTest("test\nasdf", [{ pos: 0, length: 4, number: 1 }, { pos: 5, length: 4, number: 2 }]);
  });

  await t.step("should get for multiple lines ending with a newline", () => {
    doTest("test\nasdf\n", [{ pos: 0, length: 4, number: 1 }, { pos: 5, length: 4, number: 2 }, {
      pos: 10,
      length: 0,
      number: 3,
    }]);
  });
});
