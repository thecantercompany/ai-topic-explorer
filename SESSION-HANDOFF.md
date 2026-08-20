# Session Handoff — AI Topic Explorer

**Last Updated:** August 20, 2026

## Where we are
Live in production (beta) on Railway. This session investigated two production error
reports (a `perplexity` rate-limit `provider_failure`, and a `grok` `provider_failure`
with message `Cannot read properties of undefined (reading 'toLowerCase')`) and fixed
both root causes.

## What was built this session
- **Root cause (Grok crash, but latent in all 5 clients):** `lib/ai-clients/shared.ts`'s
  `parseStructuredData` parses the model's JSON block and casts it to the declared types
  with zero per-item validation. The block is model-authored and drifts from the
  requested schema — entities as bare strings, `{"theme": ...}` instead of
  `{"phrase": ...}`, a citation with no `url`. The merge helpers
  (`lib/analysis/merge-entities.ts`, `merge-themes.ts`, `merge-citations.ts`) read
  `.name`/`.phrase`/`.url` straight off each item with no guard, so one malformed field
  threw a TypeError inside the per-provider `try` in `app/api/analyze/route.ts`,
  discarding that provider's entire merged result — including subtopic queries that had
  already succeeded.
  - **Fix:** `shared.ts` now runs `entities.people`/`entities.organizations`/`citations`/
    `keyThemes` through sanitizers (`sanitizeEntities`, `sanitizeCitations`,
    `sanitizeKeyThemes`) before anything downstream sees them — bare strings and common
    key drift (`theme`/`name`/`text` → `phrase`; missing `url` on a citation → dropped;
    missing `relevance` → defaulted to 3) are coerced instead of throwing. Verified
    against 9 malformed-payload cases (including nulls-in-arrays and wrong-container-type)
    run through the real `parseStructuredData` → merge-helper path; all now produce a
    partial result instead of throwing, and a well-formed payload is unchanged.
  - Internal errors (TypeError/RangeError/ReferenceError) surfaced through
    `categorizeError` in `route.ts` now show the user "Could not process the provider's
    response" instead of the raw JS message.
- **Root cause (Perplexity rate limiting):** two contributors, both provider-agnostic bugs
  rather than Perplexity-specific:
  1. `withTimeout` in `route.ts` fires an `AbortSignal` on timeout, but only
     `claude.ts` accepted it (added in the Aug 6/prior session). OpenAI, Gemini,
     Perplexity, and Grok all declared `(query: string)` with no signal param, so a
     timed-out request kept running to completion server-side — still burning
     rate-limit budget for a result nobody reads.
  2. All (up to 5) expanded queries fire at every provider in the same instant — a burst,
     even though per-minute volume is otherwise low.
  - **Fix:** `openai.ts`, `gemini.ts`, `perplexity.ts`, `grok.ts` now accept and pass the
    signal through to their SDK calls. `route.ts` staggers subtopic query starts 400ms
    apart (`QUERY_STAGGER_MS`) via a new abortable `sleep()`, adding the offset back to
    each query's timeout deadline so no query loses generation budget (verified: total
    added wall-clock ≈ stagger × (query count − 1), each query still gets its full 150s).
    `shared.ts` adds `REQUEST_MAX_RETRIES = 4` (up from the SDK default of 2) passed to
    the OpenAI-compatible clients (`openai`, `perplexity`, `grok`), so a transient 429
    clears via the SDK's `retry-after`-aware backoff instead of failing the subtopic query.
  - `route.ts` adds `providerErrorDetail()` — pulls HTTP status, `retry-after`, and the
    provider's own error message off the SDK error and attaches it to `reportError`
    context (previously `categorizeError` collapsed all of this to one display string,
    e.g. "Rate limited — too many requests", with the detail thrown away). Also attaches
    `succeededQueries`/`failedQueries` so a degraded-but-partial result is distinguishable
    from a fully dead provider.
- `components/Footer.tsx` / `CHANGELOG.md` — changelog entries (Aug 20).
- `PROJECT-STATUS.md` — recent-work summary updated.

## Verification status
- `npx tsc --noEmit` passes.
- `npm run build` passes with placeholder env vars for all five provider keys + a
  placeholder `DATABASE_URL`.
- No new ESLint findings (`npm run lint` reports the same 6 pre-existing
  issues as before this session's changes — none in the touched files' new code beyond
  pre-existing unused-import warnings in `openai.ts`).
- Ran the real `parseStructuredData` → `mergeEntities`/`mergeKeyThemes`/`mergeCitations`
  path against 9 constructed malformed JSON blocks (bare-string entities, wrong keys,
  missing citation urls, nulls in arrays, wrong container types) plus 1 well-formed
  control — all 9 malformed cases now degrade gracefully instead of throwing; the control
  case is unchanged. Script was temporary and deleted after passing.
- Ran the staggered-start + abortable-sleep logic standalone: confirmed starts are spaced
  ~400ms apart, each query's effective generation budget is unchanged (~999-1000ms of a
  1000ms-scaled test budget regardless of position), aborting during the pre-request
  delay rejects without firing the request, and a timeout still fires correctly while a
  task is only sleeping (no leaked timer). Script was temporary and deleted after passing.
- **Not** exercised against a live analysis run with real provider traffic (no API keys
  in this worktree). Confirm on Railway after deploy that `grok` and `perplexity`
  `provider_failure` reports for these specific causes stop appearing; if a rate-limit
  report does recur, the new `providerErrorDetail` context (status/retry-after/provider
  message) should say immediately whether it's transient or a hard quota ceiling.

## Next steps
- Watch `provider_failure` reports for `grok`/`perplexity` over the next few days to
  confirm both fixes hold under real traffic.
- Consider trimming Perplexity's fan-out below the full 5 expanded queries — it's
  excluded from the word cloud/themes/entities merge (`route.ts` skips it at
  `provider !== "perplexity" && provider !== "grok"`) and only contributes citations +
  related questions, so 1-2 queries may be enough. Not bundled into this fix since it
  changes result depth and deserves its own call.
- Consider a per-provider concurrency cap instead of/in addition to staggering if rate
  limiting recurs — more effective, but risks a longer worst-case analysis (currently
  capped near the 150s timeout, would grow toward ~300s+ if fully serialized) so it
  wasn't applied preemptively.
- Apply the same streaming + partial-recovery pattern Claude has to the OpenAI, Gemini,
  Perplexity, and Grok clients — still open from the prior session, unrelated to this
  session's fixes.

## Known gotchas
- The other four provider clients (OpenAI, Gemini, Perplexity, Grok) still use
  non-streaming calls and have no partial-recovery path — a timeout on them still
  discards the full response (this session made the timeout *cancel promptly*, not
  *recover partially*).
- The JSON block (entities/citations/keyThemes) is emitted *after* the prose in Claude's
  response, so any truncated/partial response — timeout or otherwise — loses structured
  data even though the prose survives. Moving the JSON block earlier in the prompt would
  fix this but changes output shape for all five providers and needs its own eval, not
  bundled into this fix.
- The new JSON sanitizers in `shared.ts` are permissive by design (recover what's
  recoverable) rather than strict — if a provider starts emitting systematically wrong
  data (not just occasional drift), the sanitizer will silently coerce it rather than
  surface an error. Worth revisiting if entity/theme quality degrades without a
  corresponding error-report spike.
