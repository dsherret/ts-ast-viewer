import { OptionsState } from "../types";
import { CompilerApi } from "./CompilerApi";

export function convertOptions(apiFrom: CompilerApi | undefined, apiTo: CompilerApi, options: OptionsState) {
  if (apiFrom == null || apiFrom === apiTo) {
    return options;
  }

  const scriptTarget = apiTo.ScriptTarget[apiFrom.ScriptTarget[options.scriptTarget] as any];
  const scriptKind = apiTo.ScriptKind[apiFrom.ScriptKind[options.scriptKind] as any];

  return {
    ...options,
    scriptTarget: scriptTarget == null ? apiTo.ScriptTarget.Latest : scriptTarget,
    scriptKind: scriptKind == null ? apiTo.ScriptKind.TSX : scriptKind,
  };
}
