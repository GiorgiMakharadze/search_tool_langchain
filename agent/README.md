# Search Agent Service

## Overview

This service is the backend/agent layer for the project. It exposes a single HTTP search endpoint that accepts a user question, decides whether the question can be answered directly or should use web search, runs the corresponding LangChain pipeline, and returns a normalized JSON response.

At a high level, the service handles:

- beginner-friendly direct answers for general questions
- web-assisted answers for queries that look time-sensitive, comparative, price-related, ranking-oriented, or otherwise likely to benefit from browsing
- response validation/final shaping before data is returned to the client

The code is focused on one main use case: `POST /search`.

## Tech Stack

Based on the current codebase, the service uses:

- Node.js with TypeScript
- Express for the HTTP server
- CORS middleware
- LangChain runnables for the search pipeline
- Zod for request/response and env validation
- `dotenv` for environment loading
- `html-to-text` for converting fetched HTML pages into plain text
- LLM providers via LangChain adapters:
  - OpenAI
  - Google Gemini
  - Groq

## Project Structure

Main source files live under `agent/src`:

- `index.ts`
  Starts the Express app, enables JSON parsing and CORS, and mounts the search route at `/search`.

- `routes/search_lcel.ts`
  Defines the HTTP route layer. It validates incoming request bodies with Zod and calls the search chain.

- `search_tool/searchChain.ts`
  Composes the end-to-end LangChain sequence:
  route decision -> direct/web branch -> final validation/polish.

- `search_tool/routeStrategy.ts`
  Contains the heuristic router that decides whether a query should use the direct path or the web path.

- `search_tool/directPipeline.ts`
  Runs a simple LLM-only answer path with no external sources.

- `search_tool/webPipeline.ts`
  Runs the web-assisted path:
  search -> open URLs -> summarize pages -> compose final answer with sources.

- `search_tool/finalValidate.ts`
  Validates the final answer shape and attempts a model-based repair if it does not match the expected schema.

- `search_tool/types.ts`
  Shared search pipeline types and mode enum.

- `shared/env.ts`
  Parses and validates environment variables.

- `shared/models.ts`
  Creates the active chat model based on `MODEL_PROVIDER`.

- `utils/schemas.ts`
  Zod schemas for search input/output, page opening, web search results, and summarization.

- `utils/webSearch.ts`
  Performs the external web search call. The current implementation uses Tavily.

- `utils/openUrl.ts`
  Fetches a URL, extracts text content, removes some boilerplate HTML sections, and caps the content length.

- `utils/summarize.ts`
  Summarizes fetched page content into a shorter intermediate summary for answer composition.

## How It Works

### Request flow

1. The Express app in `src/index.ts` mounts `searchRouter` at `/search`.
2. `src/routes/search_lcel.ts` validates the request body with `SearchInputSchema`.
3. The route calls `runSearch()` from `src/search_tool/searchChain.ts`.
4. `searchChain` first runs `routerStep`, which classifies the query as either `direct` or `web`.
5. A LangChain branch sends the request to either:
   - `directPath` for an LLM-only answer
   - `webPath` for search-driven answering
6. `finalValidateAndPolish` checks the final output against the response schema and may ask the model to repair malformed output.
7. The route returns JSON to the caller.

### Route layer

The route layer is intentionally small. It:

- parses input with Zod
- delegates all search behavior to the pipeline
- returns `400` on validation or pipeline errors

### Search chain

The search chain is implemented as a `RunnableSequence` with a `RunnableBranch`. This keeps the routing decision and the two answer modes inside a single composable LangChain pipeline.

### Routing strategy

`routeStrategy()` uses string heuristics, not an LLM router. It tends to choose the web path when a query is:

- long
- about recent years (for example 2024+)
- comparative or ranking-oriented
- price-related
- current/news/trending related
- compatibility/install related
- local intent (`near me`, `nearby`)

Queries that do not match those heuristics go through the direct path.

### Direct and web pipelines

`directPipeline.ts`:

- calls the configured chat model directly
- asks for a brief, clear answer for beginners
- returns no sources

`webPipeline.ts`:

- searches the web
- opens up to 5 results
- summarizes fetched content
- if page fetching/summarization fails for all results, falls back to snippets from search results when available
- if there are still no usable summaries, falls back to a direct LLM answer
- otherwise composes a final answer only from the collected summaries and returns source URLs

### Validation and finalization

`finalValidate.ts` expects the final output to match:

- `answer: string`
- `sources: string[]`

If the output does not pass schema validation, the service asks the model to repair the JSON into the expected shape. The code is conservative about the final response format, but it does not include a separate error envelope for successful responses.

### Shared config and models

`shared/env.ts` validates runtime configuration from environment variables. `shared/models.ts` chooses the active model provider and model name, then returns the corresponding LangChain chat model.

### Utility helpers

Utility modules support the web path:

- `webSearch.ts` calls the search provider
- `openUrl.ts` fetches and cleans page text
- `summarize.ts` compresses long page text into shorter summaries
- `schemas.ts` centralizes Zod schemas used across the route and pipelines

## API

### `POST /search`

Accepts a search request body validated by:

```json
{
  "q": "string, minimum length 5"
}
```

High-level successful response shape:

```json
{
  "answer": "string",
  "sources": ["https://example.com"]
}
```

Notes:

- `sources` is an array of URL strings
- direct answers currently return an empty `sources` array
- web-assisted answers return source URLs gathered from summarized pages

High-level error response shape:

```json
{
  "error": "message"
}
```

The route currently returns HTTP `400` for validation failures and other thrown errors in the route handler.

## Environment Variables

These variables are read from code in `src/shared/env.ts` and `src/index.ts`:

- `PORT`
  Server port. Defaults to `5000` in env parsing, while `src/index.ts` reads `process.env.PORT` directly.

- `ALLOWED_ORIGINS`
  Parsed in `src/shared/env.ts` as a URL with default `http://localhost:5000`.

- `ALLOWED_ORIGIN`
  Used by the Express CORS configuration in `src/index.ts`.

- `MODEL_PROVIDER`
  One of `openai`, `gemini`, or `groq`. Defaults to `openai`.

- `OPENAI_API_KEY`
  Used when `MODEL_PROVIDER=openai`.

- `GEMINI_API_KEY`
  Used when `MODEL_PROVIDER=gemini`.

- `GROQ_API_KEY`
  Used when `MODEL_PROVIDER=groq`.

- `OPENAI_MODEL`
  Defaults to `gpt-4o-mini`.

- `GEMINI_MODEL`
  Defaults to `gemini-2.0-flash-lite`.

- `GROQ_MODEL`
  Defaults to `llama-3.1-8b-instant`.

- `SEARCH_PROVIDER`
  Defaults to `tavily`. The current implementation only shows a Tavily-backed search utility.

- `TAVILY_API_KEY`
  Required for the current web search implementation.

- `TAVILY_API_URL`
  Defaults to `https://api.tavily.com/v1/search`.

Conservative note: the code suggests that at least one model API key is needed depending on `MODEL_PROVIDER`, and `TAVILY_API_KEY` is needed whenever the router selects the web path.

## Run Locally

### Install

```bash
cd agent
npm install
```

### Development

The only script currently defined in `package.json` is:

```bash
npm run dev
```

That runs:

```bash
tsx watch src/index.ts
```

### Build / start

No build or production start scripts are currently defined in `agent/package.json`.

## Notes / Limitations

- The service currently exposes only one route: `POST /search`.
- The routing strategy is heuristic-based; it is not learned or model-driven.
- The web path depends on external network access and Tavily configuration.
- `src/index.ts` uses `ALLOWED_ORIGIN`, while env parsing defines `ALLOWED_ORIGINS`. That mismatch is worth checking before relying on CORS configuration.
- `src/utils/webSearch.ts` and `src/utils/schemas.ts` contain some schema/validation inconsistencies, so the current web-search path may need code review before being considered production-ready.
- `SearchAnswerSchema` requires valid URL strings in `sources`, so any non-URL source values will be repaired or dropped during final validation.
- There is no documented health check route, test suite, or production script in the inspected files.
