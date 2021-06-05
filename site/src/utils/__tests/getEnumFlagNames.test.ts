import * as ts from "typescript";
import { getEnumFlagNames } from "../getEnumFlagNames";

describe("getEnumFlagNames", () => {
    it("should get the flag names", () => {
        expect(getEnumFlagNames(ts.SymbolFlags, 512)).toEqual([
            "ValueModule",
            "All",
            "ParameterExcludes",
            "Namespace",
            "Module",
            "FunctionScopedVariableExcludes",
            "EnumMemberExcludes",
            "ConstEnumExcludes",
            "MethodExcludes",
            "GetAccessorExcludes",
            "SetAccessorExcludes",
            "ModuleMember",
            "ExportHasLocal",
            "ExportDoesNotSupportDefaultModifier",
            "Classifiable",
        ]);
    });
});
