// @ts-nocheck — vendored from typescript-go, see GENERATED.md
export enum RegularExpressionFlags {
    None = 0,
    HasIndices = 1 << 0,
    Global = 1 << 1,
    IgnoreCase = 1 << 2,
    Multiline = 1 << 3,
    DotAll = 1 << 4,
    Unicode = 1 << 5,
    UnicodeSets = 1 << 6,
    Sticky = 1 << 7,
    AnyUnicodeMode = Unicode | UnicodeSets,
}
