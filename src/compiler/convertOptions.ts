import type { OptionsState } from "../types/index.js";
import type { CompilerApi, ScriptKind, ScriptTarget } from "./CompilerApi.js";

export function convertOptions(apiFrom: CompilerApi | undefined, apiTo: CompilerApi, options: OptionsState) {
  if (apiFrom == null || apiFrom === apiTo) {
    return options;
  }

  const scriptTarget = apiTo.ScriptTarget[apiFrom.ScriptTarget[options.scriptTarget] as any] as any as ScriptTarget;
  const scriptKind = apiTo.ScriptKind[apiFrom.ScriptKind[options.scriptKind] as any] as any as ScriptKind;

  return {
    ...options,
    scriptTarget: scriptTarget == null ? apiTo.ScriptTarget.Latest : scriptTarget,
    scriptKind: scriptKind == null ? apiTo.ScriptKind.TSX : scriptKind,
  };
}
