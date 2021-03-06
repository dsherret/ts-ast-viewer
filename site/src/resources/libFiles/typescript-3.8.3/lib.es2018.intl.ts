const fileData = {
    fileName: `/lib.es2018.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\ndeclare namespace Intl{interface PluralRulesOptions{localeMatcher?:"lookup"|"best fit";type?:"cardinal"|"ordinal";}interface ResolvedPluralRulesOptions{locale:string;pluralCategories:string[];type:"cardinal"|"ordinal";minimumIntegerDigits:number;minimumFractionDigits:number;maximumFractionDigits:number;minimumSignificantDigits:number;maximumSignificantDigits:number;}interface PluralRules{resolvedOptions():ResolvedPluralRulesOptions;select(n:number):string;}const PluralRules:{new(locales?:string|string[],options?:PluralRulesOptions):PluralRules;(locales?:string|string[],options?:PluralRulesOptions):PluralRules;supportedLocalesOf(locales:string|string[],options?:PluralRulesOptions,):string[];};}`
};

export default fileData;