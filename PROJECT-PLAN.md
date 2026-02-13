# AI Topic Explorer

## Project Overview

A web application that queries multiple AI systems with a topic and visualizes what each AI "knows" about that topic. Input a subject like "oil and gas in New Mexico," see word clouds and entity analysis showing what each AI emphasizes, which organizations it mentions, and how responses differ across systems.

## Tech Stack

- **Framework:** Next.js
- **Hosting:** Railway
- **AI APIs:** Claude (Anthropic), GPT (OpenAI), Gemini (Google)
- **Text Analysis:** Client-side JavaScript for word frequency and entity extraction

---

## Phase 0: Planning

Define the core requirements and scope. Decide which AI services to include at launch (Claude, OpenAI, Gemini). Determine what visualizations you want—word clouds, entity lists, theme comparisons, or all three. Establish naming, branding, and any design preferences. Confirm your API accounts are set up and you have keys ready. Agree on the tech stack. Create a simple project brief document that captures these decisions so we're aligned before any code gets written.

**Deliverables:**
- Project brief document with confirmed requirements
- API accounts created and keys obtained
- Design/branding decisions documented

---

## Phase 1: Foundation

Build the basic application structure. Set up the Next.js project with a clean folder organization. Create the simple input interface—a text field for entering a topic and a button to submit. Build the API route scaffolding that will handle requests. Get the app deploying to Railway with placeholder content so you have a live URL to test against throughout development.

**Deliverables:**
- Next.js project initialized with clean structure
- Basic input UI functional
- App deployed to Railway with live URL

---

## Phase 2: AI Integration

Connect to each AI service one at a time. Start with Claude since you already have API access. Add OpenAI integration. Add Gemini integration. Each integration should accept the topic, send an appropriate prompt, and return the raw response text. Build error handling for rate limits, timeouts, and failed requests. Test with a handful of topics to confirm all three services are responding correctly.

**Deliverables:**
- Claude API integration working
- OpenAI API integration working
- Gemini API integration working
- Error handling implemented
- All three services tested and returning responses

---

## Phase 3: Text Analysis

Process the AI responses into useful data. Extract key terms and calculate word frequency. Identify named entities—organizations, people, locations. Detect recurring themes or concepts across responses. Structure this data in a consistent format that the frontend can consume for visualization.

**Deliverables:**
- Word frequency extraction working
- Named entity identification working
- Structured data format defined and implemented

---

## Phase 4: Visualization

Display the results in a meaningful way. Build word cloud components for each AI's response. Create comparison views showing differences between what each AI emphasizes. Add entity lists or tables showing which organizations, people, or places each AI mentions. Make it visually clear and easy to scan.

**Deliverables:**
- Word cloud components for each AI
- Comparison view across AIs
- Entity lists/tables
- Polished, scannable UI

---

## Phase 5: Polish and Iteration

Refine based on real use. Add the ability to save or export results. Improve the prompts sent to each AI if responses aren't useful enough. Add loading states, better error messages, and UI refinements. Test with a broader range of topics to find edge cases. Document how to use it and how to maintain it.

**Deliverables:**
- Export/save functionality
- Refined prompts
- UI polish (loading states, error messages)
- User documentation

---

## Prerequisites

Before starting Phase 1, ensure you have:

- [ ] Anthropic API account and key
- [ ] OpenAI API account and key
- [ ] Google AI (Gemini) API account and key
- [ ] Railway account
- [ ] GitHub repository created for the project
