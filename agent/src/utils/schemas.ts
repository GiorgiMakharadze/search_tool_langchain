import { z } from "zod";

export const WebSearchResultSchema = z.object({
  ttile: z.string().min(1),
  url: z.url(),
  snippet: z.string().optional().default(""),
});

export const WebSearchResultsSchema = z.array(WebSearchResultSchema).max(5);

export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;
