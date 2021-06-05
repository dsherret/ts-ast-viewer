export interface LineNumberAndColumn {
    pos: number;
    number: number;
    length: number;
}

export function createLineNumberAndColumns(text: string) {
    const lineInfos: LineNumberAndColumn[] = [];
    let lastPos = 0;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "\n")
            pushLineInfo(i);
    }

    pushLineInfo(text.length);

    return lineInfos;

    function pushLineInfo(pos: number) {
        lineInfos.push({
            pos: lastPos,
            length: pos - lastPos,
            number: lineInfos.length + 1,
        });
        lastPos = pos + 1;
    }
}
