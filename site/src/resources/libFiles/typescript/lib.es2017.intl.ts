const fileData = {
    fileName: `/lib.es2017.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\ndeclare namespace Intl{interface DateTimeFormatPartTypesRegistry{day:any\ndayPeriod:any\nera:any\nhour:any\nliteral:any\nminute:any\nmonth:any\nsecond:any\ntimeZoneName:any\nweekday:any\nyear:any}type DateTimeFormatPartTypes=keyof DateTimeFormatPartTypesRegistry;interface DateTimeFormatPart{type:DateTimeFormatPartTypes;value:string;}interface DateTimeFormat{formatToParts(date?:Date|number):DateTimeFormatPart[];}}"
};

export default fileData;