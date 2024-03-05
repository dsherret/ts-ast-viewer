import { expect } from "@std/expect";
import * as enumUtils from "../enumUtils.js";

enum MyEnum {
  Value1 = 1,
  Value2 = 2,
  SameValue = 1,
}

Deno.test("enumUtils#getValues", async (t) => {
  await t.step("should get all the values of an enum", () => {
    expect(enumUtils.getValues(MyEnum)).toEqual([1, 2, 1]);
  });
});

Deno.test("enumUtils#getNames", async (t) => {
  await t.step("should get all the values of an enum", () => {
    expect(enumUtils.getNames(MyEnum)).toEqual(["Value1", "Value2", "SameValue"]);
  });
});

Deno.test("enumUtils#getNamesForValues", async (t) => {
  await t.step("should get all the names and values of an enum", () => {
    expect(enumUtils.getNamesForValues(MyEnum)).toEqual([
      { value: 1, names: ["Value1", "SameValue"] },
      { value: 2, names: ["Value2"] },
    ]);
  });
});
