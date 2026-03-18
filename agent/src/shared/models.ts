import { env } from "./env";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ModelOpts = {
  temperature?: number;
  maxTokens?: number;
};

export function getChatModel(opts: ModelOpts = {}): BaseChatModel {
  const temp = opts?.temperature ?? 0.2;

  switch (env.MODEL_PROVIDER) {
    case "gemini":
      return new ChatGoogleGenerativeAI({
        model: env.GEMINI_MODEL,
        temperature: temp,
        maxOutputTokens: opts.maxTokens,
        apiKey: env.GEMINI_API_KEY,
      });
    case "groq":
      return new ChatGroq({
        model: env.GROQ_MODEL,
        temperature: temp,
        maxTokens: opts.maxTokens,
        apiKey: env.GROQ_API_KEY,
      });
    case "openai":
      return new ChatOpenAI({
        modelName: env.OPENAI_MODEL,
        temperature: temp,
        maxTokens: opts.maxTokens,
        openAIApiKey: env.OPENAI_API_KEY,
      });
    default:
      throw new Error(`Unsupported model provider: ${env.MODEL_PROVIDER}`);
  }
}
