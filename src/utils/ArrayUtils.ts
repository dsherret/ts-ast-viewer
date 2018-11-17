import { Iterator } from "../compiler"

export class ArrayUtils {
    private constructor() {
    }

    static from<T>(iterator: Iterator<T>) {
        const array: T[] = [];
        while (true) {
            const next = iterator.next();
            if (next.done)
                return array;
            array.push(next.value);
        }
    }
}