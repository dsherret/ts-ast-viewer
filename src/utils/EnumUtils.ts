export class EnumUtils {
    private constructor() {
    }

    static getNames(e: any) {
        return Object.keys(e)
            .filter(k => typeof e[k] === "number") as string[];
    }

    static getValues<T extends number>(e: any) {
        return Object.keys(e)
            .map(k => e[k])
            .filter(v => typeof v === "number") as T[];
    }
}