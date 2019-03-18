// fix compile error in ts-creator
declare module 'prettier/standalone' {
    export interface Options {
        semi: boolean;
    }
}
