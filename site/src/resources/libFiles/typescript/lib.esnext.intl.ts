const fileData = {
    fileName: `/lib.esnext.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\ndeclare namespace Intl{interface NumberRangeFormatPart extends NumberFormatPart{source:\"startRange\"|\"endRange\"|\"shared\"}interface NumberFormat{formatRange(start:number|bigint,end:number|bigint):string;formatRangeToParts(start:number|bigint,end:number|bigint):NumberRangeFormatPart[];}}"
};

export default fileData;