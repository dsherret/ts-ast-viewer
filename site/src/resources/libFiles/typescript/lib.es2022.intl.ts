const fileData = {
    fileName: `/lib.es2022.intl.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: "/// <reference no-default-lib=\"true\"/>\ndeclare namespace Intl{interface SegmenterOptions{localeMatcher?:\"best fit\"|\"lookup\"|undefined;granularity?:\"grapheme\"|\"word\"|\"sentence\"|undefined;}interface Segmenter{segment(input:string):Segments;resolvedOptions():ResolvedSegmenterOptions;}interface ResolvedSegmenterOptions{locale:string;granularity:\"grapheme\"|\"word\"|\"sentence\";}interface Segments{containing(codeUnitIndex?:number):SegmentData;[Symbol.iterator]():IterableIterator<SegmentData>;}interface SegmentData{segment:string;index:number;input:string;isWordLike?:boolean;}const Segmenter:{prototype:Segmenter;new(locales?:BCP47LanguageTag|BCP47LanguageTag[],options?:SegmenterOptions):Segmenter;supportedLocalesOf(locales:BCP47LanguageTag|BCP47LanguageTag[],options?:Pick<SegmenterOptions,\"localeMatcher\">):BCP47LanguageTag[];};}"
};

export default fileData;