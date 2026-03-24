import { Document } from "@langchain/core/documents";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 150;

export function chunkText(text: string, source: string): Document[] {
  const clean = (text ?? "").replace(/\r\n/g, "");

  const docs: Document[] = [];

  if (!clean.trim()) return docs;

  const step = Math.max(1, CHUNK_SIZE - CHUNK_OVERLAP);

  let start = 0;
  let chunkId = 0;

  while (start < clean.length) {
    const end = Math.min(clean.length, start + CHUNK_SIZE);

    const slice = clean.slice(start, end).trim();
    if (slice.length > 0) {
      docs.push(
        new Document({
          pageContent: slice,
          metadata: {
            source,
            chunkId,
          },
        }),
      );

      chunkId += 1;
    }

    start += step;
  }

  return docs;
}
