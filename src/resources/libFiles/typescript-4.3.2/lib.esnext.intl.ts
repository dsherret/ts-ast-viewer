const fileData = {
    fileName: `/lib.esnext.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ndeclare namespace Intl{type NumberFormatPartTypes="compact"|"currency"|"decimal"|"exponentInteger"|"exponentMinusSign"|"exponentSeparator"|"fraction"|"group"|"infinity"|"integer"|"literal"|"minusSign"|"nan"|"plusSign"|"percentSign"|"unit"|"unknown";interface NumberFormatPart{type:NumberFormatPartTypes;value:string;}interface NumberFormat{formatToParts(number?:number):NumberFormatPart[];}}`
};

export default fileData;