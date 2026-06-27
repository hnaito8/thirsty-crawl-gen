# 🍷 I'm Feeling Thirsty

An AI-generated nightlife bar-crawl planner, built for a Gemini hackathon. Tell it a starting location, time, budget, and vibe — Gemini writes a multi-stop cocktail crawl with bar recommendations, drink orders, and mini social quests, plus a shareable Instagram recap card after the night's done.

## Features

- **AI itinerary planner** — Gemini turns `{ location, time, budget, mood }` into a structured JSON bar crawl (no markdown, no chit-chat — JSON only, validated against a response schema).
- **Interactive itinerary** — timeline view with per-stop drink recommendations, point-scoring "bar quests," and a reset flow.
- **Google Maps route** — one tap opens the full crawl as a multi-stop walking route in Google Maps.
- **Google Calendar events** — add any stop to your calendar via Google's official "add to calendar" links — no OAuth required.
- **AI recap card generator** — after the crawl, pick which stops you actually hit and upload your own photos. Gemini (multimodal — it looks at the photos) writes a title, subtitle, caption, and hashtags; the card itself is rendered as plain HTML/CSS at a true 1080×1350px, with no AI image generation involved. Download as PNG, share via the Web Share API, or regenerate the copy without losing your photos.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- [Tailwind CSS v4](https://tailwindcss.com)
- [Gemini API](https://ai.google.dev) via [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- [`html-to-image`](https://github.com/bubkoo/html-to-image) for client-side PNG export
- Docker + Cloud Run + Firebase Hosting for deployment

## Getting started

**Prerequisites:** Node.js 20+, npm, and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/hnaito8/thirsty-crawl-gen.git
cd thirsty-crawl-gen
npm install
cp .env.local.example .env.local
# then edit .env.local and set GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (also used by the Docker image) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server-side only — used by both `/api/plan` and `/api/story-card`. Never exposed to the browser. |

See [`.env.local.example`](.env.local.example).

## Project structure

```
app/
  page.tsx               # main UI: form → itinerary → recap tabs
  api/plan/route.ts       # POST: generates the bar-crawl itinerary
  api/story-card/route.ts # POST: generates the recap card copy (multimodal)
components/
  vibe-picker.tsx          itinerary-display.tsx     story-viewer.tsx
  story-card-generator.tsx instagram-card.tsx
lib/
  planner.ts              # Gemini call for itinerary generation
  storyCardGenerator.ts    # Gemini call for the recap card (text + photos)
  googleLinks.ts           # Google Maps / Calendar URL builders
  clientImage.ts           # client-side photo downscaling before upload
  types.ts                 # shared Itinerary / StoryCard types
```

## Deployment

This app ships as a Docker container for Cloud Run, with optional Firebase Hosting in front of it for a custom domain and CDN. See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full step-by-step guide, or jump straight in:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

## Notes

- No Google Maps Platform or Calendar API keys/OAuth are required — both integrations use Google's official URL schemes (Maps deep links, Calendar "add event" template links) rather than billed API calls.
- The recap card is genuinely rendered HTML/CSS at 1080×1350px (not an AI-generated image) and exported to PNG client-side via `html-to-image`.
