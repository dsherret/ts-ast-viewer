import { Iterator } from "../compiler";

export class ArrayUtils {
    static from<T>(iterator: Iterator<T>) {
        const array: T[] = [];
        while (true) {
            const next = iterator.next();
            if (next.done)
                return array;
            array.push(next.value);
        }
    }

    static binarySearch<T>(items: ReadonlyArray<T>, compareTo: (value: T) => number) {
        let top = items.length - 1;
        let bottom = 0;

        while (bottom <= top) {
            const mid = Math.floor((top + bottom) / 2);
            const comparisonResult = compareTo(items[mid]);
            if (comparisonResult === 0)
                return mid;
            else if (comparisonResult < 0)
                top = mid - 1;
            else
                bottom = mid + 1;
        }

        return -1;
    }

    private constructor() {
    }
}
