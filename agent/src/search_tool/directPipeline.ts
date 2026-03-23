import { RunnableLambda } from "@langchain/core/runnables";
import { Mode } from "./types";
import { getChatModel } from "../shared/models";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

type candidate = {
  answer: string;
  sources: string[];
  mode: Mode;
};

export const directPath = RunnableLambda.from(
  async (input: { q: string; mode: Mode }): Promise<candidate> => {
    const model = getChatModel({ temperature: 0.2 });

    const res = await model.invoke([
      new SystemMessage(
        [
          "You answer briefly and clearly for beginners",
          "If unsure, say so",
        ].join("\n"),
      ),
      new HumanMessage(input.q),
    ]);

    const directAns =
      typeof res.content === "string"
        ? res.content.trim()
        : String(res.content).trim();

    return {
      answer: directAns,
      sources: [],
      mode: Mode.DIRECT,
    };
  },
);
