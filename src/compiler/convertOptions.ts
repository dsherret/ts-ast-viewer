import type { OptionsState } from "../types/index.js";
import type { CompilerApi, ScriptTarget } from "./CompilerApi.js";

export function convertOptions(apiFrom: CompilerApi | undefined, apiTo: CompilerApi, options: OptionsState) {
  if (apiFrom == null || apiFrom === apiTo) {
    return options;
  }

  const scriptTarget = apiTo.ScriptTarget[apiFrom.ScriptTarget[options.scriptTarget] as any] as any as ScriptTarget;

  return {
    ...options,
    scriptTarget: scriptTarget == null ? apiTo.ScriptTarget.Latest : scriptTarget,
  };
}
