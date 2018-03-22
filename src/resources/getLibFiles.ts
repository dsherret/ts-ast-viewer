import * as libFiles from "./libFiles";

export function getLibFiles() {
    return Object.keys(libFiles).map(key => libFiles[key] as { fileName: string; text: string; });
}