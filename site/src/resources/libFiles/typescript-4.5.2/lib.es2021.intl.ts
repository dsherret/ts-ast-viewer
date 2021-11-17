const fileData = {
    fileName: `/lib.es2021.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ndeclare namespace Intl{interface DateTimeFormatOptions{formatMatcher?:"basic"|"best fit"|"best fit"|undefined;dateStyle?:"full"|"long"|"medium"|"short"|undefined;timeStyle?:"full"|"long"|"medium"|"short"|undefined;dayPeriod?:"narrow"|"short"|"long"|undefined;fractionalSecondDigits?:0|1|2|3|undefined;}interface ResolvedDateTimeFormatOptions{formatMatcher?:"basic"|"best fit"|"best fit";dateStyle?:"full"|"long"|"medium"|"short";timeStyle?:"full"|"long"|"medium"|"short";hourCycle?:"h11"|"h12"|"h23"|"h24";dayPeriod?:"narrow"|"short"|"long";fractionalSecondDigits?:0|1|2|3;}interface NumberFormat{formatRange(startDate:number|bigint,endDate:number|bigint):string;formatRangeToParts(startDate:number|bigint,endDate:number|bigint):NumberFormatPart[];}}`
};

export default fileData;