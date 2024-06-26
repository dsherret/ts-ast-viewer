import { expect } from "@std/expect";
import { LineAndColumnComputer } from "../LineAndColumnComputer.js";

Deno.test("LineAndColumnComputer#getNumberAndColumnFromPos", async (t) => {
  function doTest(text: string, pos: number, expectedResult: { lineNumber: number; column: number }) {
    const computer = new LineAndColumnComputer(text);
    const result = computer.getNumberAndColumnFromPos(pos);
    expect(result).toEqual(expectedResult);
  }

  await t.step("should get the first column when less than 0", () => {
    doTest("testing", -10, { lineNumber: 1, column: 1 });
  });

  await t.step("should get when at the first position", () => {
    doTest("testing", 0, { lineNumber: 1, column: 1 });
  });

  await t.step("should get when on the first line", () => {
    doTest("testing", 3, { lineNumber: 1, column: 4 });
  });

  await t.step("should get when at a newline", () => {
    doTest("test\ntest", 4, { lineNumber: 1, column: 5 });
  });

  await t.step("should get when after a newline", () => {
    doTest("test\ntest", 5, { lineNumber: 2, column: 1 });
  });

  await t.step("should get when inside a crlf", () => {
    // count the \r as being part of the current line
    doTest("test\r\ntest", 5, { lineNumber: 1, column: 6 });
  });

  await t.step("should get when at the end of the text", () => {
    doTest("test\ntest", 10, { lineNumber: 2, column: 5 });
  });

  await t.step("should get the last column when after the text", () => {
    doTest("test", 20, { lineNumber: 1, column: 5 });
  });
});

Deno.test("LineAndColumnComputer#getPosFromLineAndColumn", async (t) => {
  function doTest(text: string, line: number, column: number, expectedResult: number) {
    const computer = new LineAndColumnComputer(text);
    const result = computer.getPosFromLineAndColumn(line, column);
    expect(result).toEqual(expectedResult);
  }

  await t.step("should get when it's an empty string", () => {
    doTest("", 1, 1, 0);
  });

  await t.step("should get when it's a line number below 1", () => {
    doTest("test\nthis", 0, 1, 0);
  });

  await t.step("should get when at the start", () => {
    doTest("test", 1, 1, 0);
  });

  await t.step("should get when at the end", () => {
    doTest("test", 1, 5, 4);
  });

  await t.step("should get the end pos when extending beyond the max column", () => {
    doTest("test\nthis\nout", 1, 6, 4);
  });

  await t.step("should get when on the second line", () => {
    doTest("test\ntesting\nother", 2, 2, 6);
  });

  await t.step("should get when specifying a line number beyond the max", () => {
    doTest("test\nother", 5, 2, 10);
  });
});
