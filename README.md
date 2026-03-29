# ET Pulse — AI-Native News Intelligence

> **"I can't go back to reading news the old way."**

**Team:** AAM_MUNDE &nbsp;|&nbsp; **Track:** AI-Native News Experience (Problem Statement #8)

**Builder:** Madhav Tiwari &nbsp;|&nbsp; +91-9374105274 &nbsp;|&nbsp; tiwarimadhav2309@gmail.com &nbsp;|&nbsp; [linkedin.com/in/madhav-tiwari2309](https://linkedin.com/in/madhav-tiwari2309) &nbsp;|&nbsp; [github.com/madhav-09](https://github.com/madhav-09)

**Credentials:** GATE 2026 (CS) Qualified · AWS Certified Cloud Practitioner

---

## The Problem

Business news in 2026 is still delivered like it's 2005:

- **One-size-fits-all homepage** — a mutual fund investor and a college student see the exact same layout
- **8 articles to understand 1 story** — no synthesis, no context, no intelligence
- **English-only** — 500 million Hindi/Tamil/Telugu/Bengali-first Indians are underserved
- **Passive consumption** — read, close, forget. No interaction, no follow-up, no depth
- **No narrative tracking** — stories evolve over weeks; readers have no way to track them

> The result: people spend **38 minutes/day** consuming news but retain almost nothing actionable.

---

## The Solution

ET Pulse is not a filtered feed. It is a **fundamentally different intelligence experience** — a personalized AI newsroom that synthesizes, explains, translates, and converses.

### Live Features

| Feature | Route | What it does |
|---|---|---|
| **My ET** — Personalized Newsroom | `/feed` | Real news via NewsAPI, filtered by persona + topics. Investor gets markets. Founder gets funding. Student gets explainers. |
| **Deep Briefing** — Intelligence Navigator | `/briefing` | AI synthesizes any topic into Summary, Market Impact, Key Players, Sector Impact, Timeline, Watch Signals — with live follow-up chat |
| **Story Arc Tracker** | `/story` | AI builds full visual narrative: interactive timeline, sentiment trend chart, key players, contrarian view, predictions |
| **Intelligence Search** | `/search` | Search any company/topic → instant AI intelligence summary, sentiment score, market impact rating, story arc, and chat |
| **Vernacular Engine** | All pages | Real-time translation into Hindi, Tamil, Telugu, Bengali — culturally adapted, not literal |

### What Makes This Different

| Traditional ET | ET Pulse |
|---|---|
| Same homepage for everyone | Personalized by persona + topics |
| Read 8 articles for context | 1 AI briefing synthesizes everything |
| English only | 5 languages, culturally adapted |
| Passive reading | Interactive chat + follow-up |
| No story tracking | Visual narrative arc with sentiment |
| No search intelligence | AI-powered search with full context |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/madhav-09/-ET-Pulse-.git
cd et-pulse
npm install
```

### 2. Create `.env.local`

```bash
# Required — AI for briefings, story arcs, translation, chat
GEMINI_API_KEY=your_gemini_api_key

# Required — real news articles
NEWS_API_KEY=your_newsapi_key
```

**Get your keys:**
- Gemini API key (free): https://aistudio.google.com/app/apikey
- NewsAPI key (free tier): https://newsapi.org/register

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
  page.tsx                  # Onboarding (3-step: persona → topics → language)
  feed/page.tsx             # My ET — personalized news feed
  briefing/page.tsx         # Deep Briefing + AI chat
  story/page.tsx            # Story Arc Tracker
  search/page.tsx           # Intelligence Search
  api/
    news/route.ts           # GET  — fetches NewsAPI articles
    briefing/route.ts       # POST — Gemini briefing synthesis
    chat/route.ts           # POST — Gemini follow-up Q&A
    arc/route.ts            # POST — Gemini story arc builder
    translate/route.ts      # POST — Gemini vernacular translation
    summarize/route.ts      # POST — Gemini article summarizer
    search/route.ts         # GET  — search intelligence (news + arc + AI summary)

components/
  NewsCard.tsx              # Feed card with Deep Briefing + Story Arc links
  BriefingPanel.tsx         # Structured briefing display
  ChatBox.tsx               # Conversational AI follow-up
  Timeline.tsx              # Custom React timeline (sentiment color-coded)
  SentimentChart.tsx        # Recharts AreaChart sentiment trend
  LanguageToggle.tsx        # EN / हिंदी / தமிழ் / తెలుగు / বাংলা switcher
  SearchBar.tsx             # Global nav search with autocomplete (⌘K)
  LoadingSkeletons.tsx      # Shimmer skeletons for all pages
  ErrorState.tsx            # Retry-able error display

lib/
  grok.ts                   # NewsAPI fetcher with keyword sentiment scoring
  grok-ai.ts                # All Gemini AI functions (briefing, arc, translate, chat, search)
  json.ts                   # Robust JSON extraction from AI responses
  route-utils.ts            # API response helpers (success/failure)
  profile-storage.ts        # localStorage profile helpers

types/
  index.ts                  # NewsItem, UserProfile, BriefingData, StoryArc, SearchIntelligence
```

---

## Tech Stack

- **Framework**: Next.js 16 App Router (TypeScript)
- **AI**: Google Gemini 2.0 Flash (via OpenAI-compatible endpoint)
- **News Data**: NewsAPI — real-time articles filtered by topic
- **Charts**: Recharts (AreaChart for sentiment trends)
- **Timeline**: Custom React component (color-coded by sentiment)
- **Styling**: Tailwind CSS v4 — dark glass-morphism design system
- **Icons**: Lucide React
- **Storage**: localStorage (profile persistence, no backend required)
- **Hosting**: Vercel-ready

---

## How the AI Works

All AI calls go through `lib/grok-ai.ts` → Gemini 2.0 Flash via 5 specialized agents:

```
User action → Next.js API route → Gemini 2.0 Flash → JSON parsed → UI rendered
```

| Agent | Function | Output | Tokens |
|---|---|---|---|
| Briefing Synthesizer | `createBriefing()` | 7-field JSON briefing | 2000 |
| Story Arc Builder | `buildStoryArc()` | events + players + contrarian + predictions | 1500 |
| Follow-up Chat | `askFollowUp()` | Context-grounded plain text | 1500 |
| Vernacular Translator | `translateText()` | Culturally adapted translation | 1500 |
| Search Intelligence | `generateSearchIntelligence()` | sentiment + impact + themes | 800 |

**Error handling:** 3× retry on 429 (2s → 4s → 8s backoff) · fallback data on failure · UI never breaks

---

## Onboarding Flow

```
/ (onboarding)
  Step 1: Persona    → Investor | Founder | Student | Trader
  Step 2: Topics     → Markets, Startups, Policy, Banking, IPO, Crypto, Budget, Tech
  Step 3: Language   → EN | हिंदी | தமிழ் | తెలుగు | বাংলা
  → saves to localStorage → redirects to /feed
```

Returning users are auto-redirected to `/feed`. "Switch User" clears profile.

---

## Business Impact

| Category | Annual Value |
|---|---|
| User time saved (26 min/day × 3M DAU) | ₹19,500 crore social value |
| Incremental ad revenue (2.3× session lift) | ₹788 crore |
| ET Prime conversion lift (+50% relative) | ₹12 crore |
| Vernacular market expansion (350M users) | ₹35 crore |
| **Total direct revenue impact** | **₹835 crore (~$100M)** |

- Operating cost at 3M DAU: **₹1.85 crore/year** (Gemini + NewsAPI)
- **ROI: 451×**

See [IMPACT.md](./IMPACT.md) for full assumptions and calculations.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system diagram, agent roles, data flow, and error handling logic.

---

## Commit History

```
4bc8457  Initial commit from Create Next App
3a568c6  feat: core types, JSON parser, route utils, profile storage
a45b904  feat: AI layer — Gemini 2.0 Flash + NewsAPI integration
87c71f5  feat: API routes — news, briefing, chat, arc, translate, search, summarize
02adf27  feat: UI components — news card, briefing panel, chat, timeline, charts
08442de  feat: pages — onboarding, feed, briefing, story arc, intelligence search
4182e57  feat: layout, design system, dependencies
c12cc45  docs: README, architecture document, impact model
2e337fd  chore: remove unused boilerplate files
c6fd804  docs: add architecture diagram image (archi.png)
```

---

*Built by Team AAM_MUNDE · Madhav Tiwari · GATE 2026 (CS) · AWS Certified Cloud Practitioner*
*tiwarimadhav2309@gmail.com · +91-9374105274 · [linkedin.com/in/madhav-tiwari2309](https://linkedin.com/in/madhav-tiwari2309) · [github.com/madhav-09](https://github.com/madhav-09)*
