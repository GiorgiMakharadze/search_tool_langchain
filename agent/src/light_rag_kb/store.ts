import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";

type Provider = "openai" | "google";

function getProvider(): Provider {
  const getCurrentProvider = (
    process.env.RAG_MODEL_PROVIDER ?? "gemini"
  ).toLowerCase();
  return getCurrentProvider === "gemini" ? "google" : "openai";
}

function makeOpenAIEmbenddings() {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAIEmbeddings({
    apiKey: key,
    model: "text-embedding-3-small",
  });
}

function makeGoogleEmbeddings() {
  const key = process.env.GOOGLE_API_KEY ?? "";
  if (!key) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  return new GoogleGenerativeAIEmbeddings({
    apiKey: key,
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
}

function makeEmbeddings(provider: Provider) {
  return provider === "google"
    ? makeGoogleEmbeddings()
    : makeOpenAIEmbenddings();
}

let store: MemoryVectorStore | null = null;
let currentSetProviderBound: Provider | null = null;

export function getVectorStore(): MemoryVectorStore {
  const provider = getProvider();

  if (store && currentSetProviderBound === provider) {
    return store;
  }

  store = new MemoryVectorStore(makeEmbeddings(provider));
  currentSetProviderBound = provider;
  return store;
}

export async function addChunks(docs: Document): Promise<number> {
  if (!Array.isArray(docs) || docs.length === 0) return 0;

  const store = getVectorStore();

  await store.addDocuments(docs);

  return docs.length;
}

export function resetStore() {
  store = null;
  currentSetProviderBound = null;
}
