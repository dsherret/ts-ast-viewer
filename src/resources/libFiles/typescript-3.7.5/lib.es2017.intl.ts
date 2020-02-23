export default {
    fileName: `/lib.es2017.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ndeclare namespace Intl{type DateTimeFormatPartTypes="day"|"dayPeriod"|"era"|"hour"|"literal"|"minute"|"month"|"second"|"timeZoneName"|"weekday"|"year";interface DateTimeFormatPart{type:DateTimeFormatPartTypes;value:string;}interface DateTimeFormat{formatToParts(date?:Date|number):DateTimeFormatPart[];}}`
};