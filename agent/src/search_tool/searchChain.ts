import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import { Mode } from "./types";
import { webPath } from "./webPipeline";
import { directPath } from "./directPipeline";
import { routerStep } from "./routeStrategy";
import { finalValidateAndPolish } from "./finalValidate";
import { SearchInput } from "../utils/schemas";

const branch = RunnableBranch.from<{ q: string; mode: Mode }, any>([
  [(input) => input.mode === Mode.WEB, webPath],
  directPath,
]);

export const searchChain = RunnableSequence.from([
  routerStep,
  branch,
  finalValidateAndPolish,
]);

export async function runSearch(input: SearchInput) {
  return await searchChain.invoke(input);
}
