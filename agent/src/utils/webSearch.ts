import { env } from "../shared/env";
import { WebSearchResultSchema } from "./schemas";

export async function webSearch(q: string) {
  const query = (q ?? "").trim();
  if (!query) return [];

  return await searchTavilyUtil(query);
}

async function searchTavilyUtil(query: string) {
  if (!env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set in environment variables");
  }

  const response = await fetch(env.TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_answers: false,
      include_image: false,
    }),
  });

  if (!response.ok) {
    const text = await safeText(response);
    throw new Error(
      `Tavily API error: ${response.status} ${response.statusText} - ${text}`,
    );
  }

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  const normilizedResult = results.slice(0, 5).map((r: any) =>
    WebSearchResultSchema.parse({
      title: String(r?.title ?? "").trim() || "Untitled",
      url: String(r?.url ?? "").trim(),
      snippet: String(r?.content ?? "")
        .trim()
        .slice(0, 220),
    }),
  );

  return WebSearchResultSchema.parse(normilizedResult);
}

export async function safeText(res: Response) {
  try {
    return await res.json();
  } catch {
    return "<no body>";
  }
}
