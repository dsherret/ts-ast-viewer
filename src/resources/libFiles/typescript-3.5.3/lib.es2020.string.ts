export default {
    fileName: `/lib.es2020.string.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text: `/// <reference no-default-lib="true"/>\n/// <reference lib="es2015.iterable" />\ninterface String{/** * Matches a string with a regular expression, and returns an iterable of matches * containing the results of that search. * @param regexp A variable name or string literal containing the regular expression pattern and flags. */matchAll(regexp:RegExp):IterableIterator<RegExpMatchArray>;}`
};