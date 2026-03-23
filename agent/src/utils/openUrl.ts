import { OpenUrlOutputSchema } from "./schemas";
import { safeText } from "./webSearch";
import { convert } from "html-to-text";

export async function openUrl(url: string) {
  const normalizedUrl = validateUrl(url);
  const res = await fetch(normalizedUrl, {
    headers: {
      "User-Agent": "agent-core/1.0 (+course-demo)",
    },
  });

  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(
      `Failed to fetch URL: ${res.status} ${res.statusText} - ${body}`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  const text = contentType.includes("text/html")
    ? convert(raw, {
        wordwrap: false,
        selectors: [
          {
            selector: "nav",
            format: "skip",
          },
          {
            selector: "header",
            format: "skip",
          },
          {
            selector: "footer",
            format: "skip",
          },
          {
            selector: "script",
            format: "skip",
          },
          {
            selector: "style",
            format: "skip",
          },
        ],
      })
    : raw;

  const cleaned = collapseWhitespace(text);
  const capped = cleaned.slice(0, 10000);

  return OpenUrlOutputSchema({
    url: normalizedUrl,
    content: capped,
  });
}

function validateUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (!/^https?:/.test(parsedUrl.protocol)) {
      throw new Error(`URL must start with http:// or https://: ${url}`);
    }
    return parsedUrl.toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

function collapseWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}
