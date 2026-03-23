# Search Tool LangChain

## Overview

This repository contains a small two-part search application:

- `agent/` is the backend search service
- `client/` is the frontend web UI

At a high level, the frontend collects a query from the user and sends it to the backend. The backend decides whether to answer directly with an LLM or use a web-assisted search path, then returns a normalized response with an answer and optional source URLs.

The current codebase looks like an in-progress prototype or MVP rather than a fully productized monorepo. Each part runs as its own Node.js app from its own folder.

## Repository Structure

- `agent/`
  Express + TypeScript backend that exposes the search API and runs the LangChain-based search pipeline.

- `client/`
  Next.js + React frontend that provides a chat-like UI for asking questions and rendering answers with sources.

## Architecture Summary

Based on the current code:

1. A user types a question into the frontend in `client/src/app/page.tsx`.
2. The client sends a `POST` request to `${NEXT_PUBLIC_API_URL}/search`.
3. The backend in `agent/src/index.ts` mounts a router at `/search`.
4. The backend validates the request and runs the search chain.
5. The chain routes the query to either:
   - a direct LLM answer path
   - a web-search path that searches, opens pages, summarizes them, and composes an answer
6. The backend returns JSON with:
   - `answer`
   - `sources`
7. The frontend renders the answer and any returned source links.

Conservative note: this repo clearly shows the client-to-agent request flow, but it does not include a shared workspace-level runner or orchestration layer. The two apps are started separately.

## Tech Stack

Across the repository, the main stack is:

- TypeScript
- Node.js
- Next.js 16 + React 19 in `client/`
- Express in `agent/`
- LangChain in `agent/`
- Zod for validation in `agent/`
- Tailwind CSS 4 in `client/`

The agent can use different model providers depending on environment configuration:

- OpenAI
- Google Gemini
- Groq

## Getting Started

### 1. Install dependencies

Install each app separately:

```bash
cd agent
npm install
```

```bash
cd client
npm install
```

### 2. Run the backend

From `agent/`:

```bash
npm run dev
```

This starts the Express service using `tsx watch src/index.ts`.

### 3. Run the frontend

From `client/`:

```bash
npm run dev
```

This starts the Next.js development server.

### 4. Connect the apps

The frontend reads the backend base URL from `NEXT_PUBLIC_API_URL` and sends requests to `${NEXT_PUBLIC_API_URL}/search`.

The backend serves the search endpoint at `POST /search`.

Conservative note: the exact local `.env` setup is not centralized at the repository root. Environment variables are defined within the individual apps' code, especially in `agent/src/shared/env.ts` and `client/src/lib/config.ts`.

## Folder-Specific Docs

- Backend documentation: [agent/README.md](agent/README.md)
- Frontend documentation: [client/README.md](client/README.md)

## Current Status / Notes

- The repository appears to be organized as two separate apps rather than a fully managed monorepo with shared scripts.
- The client is currently a focused single-page interface.
- The backend is currently centered on one API endpoint: `POST /search`.
- The backend README documents a few implementation caveats, including environment naming inconsistencies and some web-search-path rough edges visible in code.
