import { ArrayUtils } from "./ArrayUtils";
import { LineNumberAndColumn, createLineNumberAndColumns } from "./createLineNumberAndColumns";

/** An efficient way to compute the line and column of a position in a string. */
export class LineAndColumnComputer {
    private lineInfos: LineNumberAndColumn[];

    constructor(public readonly text: string) {
        this.lineInfos = createLineNumberAndColumns(text);
    }

    getNumberAndColumnFromPos(pos: number) {
        if (pos < 0)
            return { lineNumber: 1, column: 1 };

        const index = ArrayUtils.binarySearch(this.lineInfos, info => {
            if (pos < info.pos)
                return -1;
            if (pos >= info.pos && pos < info.pos + info.length + 1) // `+ 1` is for newline char
                return 0;
            return 1;
        });
        const lineInfo = index >= 0 ? this.lineInfos[index] : this.lineInfos[this.lineInfos.length - 1];

        if (lineInfo == null)
            return { lineNumber: 1, column: 1 };

        return { lineNumber: lineInfo.number, column: Math.min(pos - lineInfo.pos + 1, lineInfo.length + 1) };
    }

    getPosFromLineAndColumn(line: number, column: number) {
        if (this.lineInfos.length === 0 || line < 1)
            return 0;

        const lineInfo = this.lineInfos[line - 1];
        if (lineInfo == null) {
            const lastLineInfo = this.lineInfos[this.lineInfos.length - 1];
            return lastLineInfo.pos + lastLineInfo.length;
        }
        return lineInfo.pos + Math.min(lineInfo.length, column - 1);
    }
}
