# Search Client

## Overview

This folder contains the frontend for the project: a Next.js App Router application that provides a simple chat-style interface for the search agent backend.

Its current responsibility is narrow and clear:

- collect a user query
- send the query to the backend search API
- render the answer and any returned source links
- show a basic loading state and simple error fallback message

Based on the code, this looks like an MVP or early-stage UI rather than a heavily developed product surface. The app currently centers around a single page and a small set of reusable UI primitives.

## Tech Stack

The frontend currently uses:

- Next.js 16
- React 19
- TypeScript
- App Router (`src/app`)
- Tailwind CSS 4
- `tw-animate-css`
- shadcn-style UI primitives configured via `components.json`
- Radix UI primitives used by some shared UI components
- `class-variance-authority`, `clsx`, and `tailwind-merge` for styling utilities
- `next/font/google` with Geist and Geist Mono

## Project Structure

Main frontend files live under `client/src`:

- `app/layout.tsx`
  Root layout for the App Router app. It imports global styles, configures Geist fonts, and renders the shared HTML/body shell.

- `app/page.tsx`
  The main client page. It contains the chat/search UI, request logic, loading state, and rendering of answers and source links.

- `app/globals.css`
  Global Tailwind styles and theme variables.

- `lib/config.ts`
  Exposes `API_URL` from `NEXT_PUBLIC_API_URL`. The page uses this value to call the backend.

- `lib/utils.ts`
  Contains the shared `cn()` utility for merging class names.

- `components/ui/*`
  Reusable UI primitives such as `Button`, `Input`, `Textarea`, `Card`, and `Separator`.

Other config files:

- `package.json`
  Frontend scripts and dependencies.

- `tsconfig.json`
  TypeScript configuration with the `@/*` path alias pointing to `src/*`.

- `next.config.ts`
  Present, but currently contains the default empty Next.js config object.

- `components.json`
  shadcn-style component configuration, including aliases and Tailwind CSS entrypoint.

## How It Works

### App flow

The current UI is implemented entirely in `src/app/page.tsx` as a client component.

1. The user types a query into the input field.
2. On form submit, the page sends a `POST` request to `${NEXT_PUBLIC_API_URL}/search`.
3. The request body is:

```json
{
  "q": "user query"
}
```

4. The page appends the user message to local chat state immediately.
5. While the request is running, it shows a small `Thinking` placeholder.
6. On success, it renders:
   - the returned `answer`
   - the returned `sources` as clickable links
   - a simple elapsed time value based on `performance.now()`
7. On failure, it renders a generic assistant error message.

### Layout and styling

- `layout.tsx` sets up the root document and font variables.
- `globals.css` defines theme tokens and base styling using Tailwind CSS 4.
- The page uses simple utility-first styling rather than a larger design system.

### Reusable components

The page currently imports:

- `Button`
- `Input`

Other UI components exist in `src/components/ui`, but they are not heavily used by the current page yet.

### Backend dependency

The client depends on `NEXT_PUBLIC_API_URL` being defined. The code assumes this variable exists and uses a non-null assertion in `src/lib/config.ts`.

## Run Locally

### Install

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start

```bash
npm run start
```

## Notes / Limitations

- The app currently appears to be a single-page frontend centered on one search/chat screen.
- `metadata` in `src/app/layout.tsx` still uses the default Create Next App title and description.
- `next.config.ts` is present but effectively empty.
- Several generated/shared UI primitives exist, but the current UI only uses a small subset of them.
- The page stores chat state only in local component state; there is no persistence visible in the inspected code.
- The client expects the backend to expose `POST /search` and to return an object with `answer` and `sources`.
- The build in this environment may depend on external font fetching because the app uses `next/font/google`.
