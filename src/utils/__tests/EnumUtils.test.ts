import { EnumUtils } from "../EnumUtils";

describe("EnumUtils", () => {
    enum MyEnum {
        Value1 = 1,
        Value2 = 2
    }

    it("should get all the values of an enum", () => {
        expect(EnumUtils.getValues(MyEnum)).toEqual([1, 2]);
    });

    it("should get all the values of an enum", () => {
        expect(EnumUtils.getNames(MyEnum)).toEqual(["Value1", "Value2"]);
    });
});
