# AI Topic Explorer

## Project Overview

A web application that queries multiple AI systems (Claude, GPT, Gemini) with a user-provided topic and visualizes what AI collectively knows about it. Results are displayed through a combined word cloud, linked named entities, and AI-suggested citations. Results are stored in Postgres and shareable via unique URLs.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Hosting:** Railway
- **Database:** PostgreSQL (Railway) via Prisma 7
- **AI APIs:** Claude Haiku (Anthropic), GPT-4o-mini (OpenAI), Gemini Flash (Google)
- **Word Cloud:** @cp949/react-wordcloud (React 19 compatible)
- **Text Analysis:** Hybrid — AI extracts entities/citations, client-side JS counts word frequency

---

## Key Design Decisions

- **Combined visualizations** — one word cloud and one entity list merging all AI responses (not per-AI)
- **Citations section** — AIs provide source URLs; shown as clickable links with provider badges and disclaimer
- **Wait-for-all reveal** — progress tracker shows per-AI status, results appear only when all have responded or failed
- **Shareable results** — stored in Postgres, accessible via unique URLs like `/results/abc123`
- **Budget-friendly models** — Claude Haiku, GPT-4o-mini, Gemini Flash to keep costs low
- **Cost guardrails** — rate limiting (10/hour per IP), 1000 token cap per AI call, kill switch env var

---

## Build Order

1. **Phase 1:** Foundation — Next.js, homepage with methodology section, Prisma/Postgres, Railway deploy
2. **Phase 2:** AI integration — Claude only first, API route with rate limiting + kill switch, save to DB
3. **Phase 3:** Text analysis — word frequency counting, entity merging, citation merging
4. **Phase 4:** Visualization — results page, word cloud, entities, citations, share button, progress tracker
5. **Phase 5:** Add OpenAI + Gemini — plug in remaining providers (auto-detected via env vars)

---

## Phase 1: Foundation

- Next.js project with TypeScript, Tailwind, App Router
- Prisma 7 with PostgreSQL adapter (`@prisma/adapter-pg`)
- Homepage: hero section with input form, example topic chips, methodology "How It Works" section, attribution footer
- Railway deployment with standalone output

---

## Phase 2: AI Integration (Claude First)

- Type definitions for AIResponse, AnalysisResult, entities, citations, word frequencies
- Claude Haiku client wrapper with structured prompt requesting analysis + JSON (entities with URLs + citations)
- API route: kill switch check → rate limit check → auto-detect configured providers → parallel AI calls via `Promise.allSettled` → merge results → save to Postgres → return `{ id, ...result }`
- Rate limiting: 10 analyses/hour per IP, in-memory

---

## Phase 3: Text Analysis

- Word frequency: stop-word filtering, frequency counting, merging across providers
- Entity merging: deduplication by normalized name, preserves URLs
- Citation merging: deduplication by URL, tracks which providers suggested each, sorts by multi-provider consensus

---

## Phase 4: Visualization

- Results page loads from Postgres by ID (works for fresh analysis AND shared links)
- Combined word cloud (neutral blue/slate palette)
- Entity list with clickable links (People, Organizations, Locations, Concepts)
- Citation list with provider badges, disclaimer, and AEO Checker callout
- Progress tracker showing per-AI status
- Share button copies URL to clipboard
- Partial failure banner when some AIs fail

---

## Phase 5: Add OpenAI + Gemini

- Install `openai` and `@google/generative-ai` SDKs
- Create client wrappers following same pattern as Claude
- Add API keys to env — API route auto-detects and activates them
- Test parallel execution and merging with multiple providers

---

## Cost & Abuse Guardrails

- **Rate limiting:** 10/hour per IP (in-memory)
- **Token cap:** 1000 max tokens per AI call
- **Kill switch:** `ANALYSIS_ENABLED` env var
- **Estimated cost:** ~$0.01 per analysis, ~$30/month worst case

---

## Post-MVP Roadmap

### Brand/AEO Mode
- "Is your brand mentioned by AI?" — enter a brand name, see what AIs know
- Brand recognition score, associated keywords, cited pages
- Funnel to AEO Checker

---

## Prerequisites

- [x] Anthropic API account and key
- [ ] OpenAI API account and key
- [ ] Google AI (Gemini) API account and key
- [ ] Railway account with Postgres database
- [ ] GitHub repository
