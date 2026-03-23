import { z } from "zod";

export const WebSearchResultSchema = z.object({
  ttile: z.string().min(1),
  url: z.url(),
  snippet: z.string().optional().default(""),
});

export const WebSearchResultsSchema = z.array(WebSearchResultSchema).max(5);

export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;

export const OpenUrlInputSchema = z.object({
  url: z.url(),
});

export const OpenUrlOutputSchema = z.object({
  url: z.url(),
  content: z.string().min(1),
});

export const SummarizeInputSchema = z.object({
  text: z.string().min(50, "Need a bit more text to summarize"),
});

export const SummarizeOutputSchema = z.object({
  summary: z.string().min(1),
});

export const SearchInputSchema = z.object({
  q: z.string().min(5, "ask a bit more specific question"),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
