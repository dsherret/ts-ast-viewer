import { EnumUtils } from "../EnumUtils";

describe("EnumUtils", () => {
    enum MyEnum {
        Value1 = 1,
        Value2 = 2,
        SameValue = 1,
    }

    describe("#getValues", () => {
        it("should get all the values of an enum", () => {
            expect(EnumUtils.getValues(MyEnum)).toEqual([1, 2, 1]);
        });
    });

    describe("#getNames", () => {
        it("should get all the values of an enum", () => {
            expect(EnumUtils.getNames(MyEnum)).toEqual(["Value1", "Value2", "SameValue"]);
        });
    });

    describe("#getNamesForValues", () => {
        it("should get all the names and values of an enum", () => {
            expect(EnumUtils.getNamesForValues(MyEnum)).toEqual([
                { value: 1, names: ["Value1", "SameValue"] },
                { value: 2, names: ["Value2"] },
            ]);
        });
    });
});
