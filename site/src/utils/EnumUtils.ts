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

    static getNamesForValues(e: any) {
        const values: { [value: number]: string[] } = {};

        for (const name of this.getNames(e)) {
            const value = e[name];
            if (values[value] == null)
                values[value] = [];
            values[value].push(name);
        }

        return Object.keys(values).map(key => ({
            value: parseInt(key, 10),
            names: values[key] as string[],
        }));
    }
}
