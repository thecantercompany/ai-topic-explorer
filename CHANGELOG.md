# Changelog

All notable changes to AI Topic Explorer will be documented in this file.

## [2026-02-15]

### Added
- Show specific error reasons when an AI provider fails (e.g., "Timed out after 60s", "Rate limited", "API overloaded")
- Error details now visible during analysis loading and on the results page failure banner
- Add error logging to database for daily error reports (new ErrorLog model with 6 instrumentation points)

### Fixed
- Long entity names, citations, and word context excerpts no longer overflow on small screens

## [2026-02-14]

### Fixed
- Upgrade Gemini from deprecated 2.0 Flash to 2.5 Flash (with thinking disabled) to fix failures
- Disable Gemini safety filters so sensitive topics (politics, social issues) aren't blocked
- Increase per-provider timeout from 45s to 60s so Claude has enough time to respond
- Switch Gemini from thinking model (2.5 Flash) to non-thinking model (2.0 Flash) to prevent timeouts
- Add 45-second per-provider timeouts so one slow AI provider can't stall the entire analysis
- Retry database save on failure instead of navigating to broken results page
- Add 3-minute client-side stream timeout so analysis doesn't hang forever
- Validate results data before rendering to prevent crashes on malformed records
- Cancel server-side AI calls when client disconnects to save API costs
- Fix rate limiter memory leak from orphaned cleanup interval
- Fix TypeScript type assertion for Perplexity API return_related_questions parameter

### Changed
- Update site metadata description to include all 5 AI platforms (Claude, ChatGPT, Gemini, Perplexity, Grok)
- Update OG social card image with 5 provider dots and refreshed tagline
- Update Apple icon to show 5 dots representing all AI providers
- Change Grok pill color from blue to red to match X/Twitter branding
- Remove disclaimer text from X Perspective quoted phrases section
- Hide changelog link on results page to reduce sidebar clutter
- Replace bulky Web Perspective section with lightweight Perplexity section showing only related questions
- Show top 10 citations with same-domain companions instead of capped-at-25 list; compact single-line layout
- Cap named entities at 15 per category (people/organizations), sorted by number of mentions
- Add explainer text under Named Entities section header
- Show provider pills (Claude, GPT, Gemini) next to each named entity
- Redesign Grok X / Social Perspective section to show quoted phrases from X/Twitter
- Rename section to "X Perspective" with Grok platform pill, clarify phrases are AI-generated
- Cut X Perspective phrases from 15 to 8 and request longer, fuller talking points
- Add explainer subtitles to Citations and Related Questions sections

### Added
- Add Grok (xAI) as 5th AI provider with separate "X / Social Perspective" section
- Add topic pre-fill from URL query parameters for Explore Further links
- Add changelog modal to footer
- Add GA4 analytics, event tracking, and increase max AI response length
- Add OpenAI, Gemini, and Perplexity providers for multi-AI comparison

## [2026-02-13]

### Fixed
- Fix mobile overflow on Key Themes, Citations, and main content area

### Added
- Add OG/Twitter metadata, expand floating keywords, and improve UI polish
