# ET Pulse — AI-Native News Intelligence

> **"I can't go back to reading news the old way."**

ET Pulse reimagines business news for 2026 — not a filtered feed, but a fundamentally different intelligence experience. Every user gets a personalized newsroom, AI-synthesized deep briefings, interactive story arc tracking, and real-time vernacular translation.

---

## Live Features

| Feature | Route | What it does |
|---|---|---|
| **My ET** — Personalized Newsroom | `/feed` | Real news via NewsAPI, filtered by persona + topics. Investor gets markets. Founder gets funding. Student gets explainers. |
| **Deep Briefing** — Intelligence Navigator | `/briefing` | AI synthesizes any topic into Summary, Market Impact, Key Players, Sector Impact, Timeline, Watch Signals — with live follow-up chat |
| **Story Arc Tracker** | `/story` | AI builds full visual narrative: interactive timeline, sentiment trend chart, key players, contrarian view, predictions |
| **Intelligence Search** | `/search` | Search any company/topic → instant AI intelligence summary, sentiment score, market impact rating, story arc, and chat |
| **Vernacular Engine** | All pages | Real-time translation into Hindi, Tamil, Telugu, Bengali — culturally adapted, not literal |

---

## Tech Stack

- **Framework**: Next.js 16 App Router (TypeScript)
- **AI**: Google Gemini 2.0 Flash (via OpenAI-compatible endpoint) — briefings, story arcs, translation, chat, search intelligence
- **News Data**: NewsAPI — real-time articles filtered by topic
- **Charts**: Recharts (AreaChart for sentiment trends)
- **Timeline**: Custom React component (color-coded by sentiment)
- **Styling**: Tailwind CSS v4 — dark glass-morphism design system
- **Icons**: Lucide React
- **Storage**: localStorage (profile persistence, no backend required)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/et-pulse.git
cd et-pulse
npm install
```

### 2. Create `.env.local`

```bash
# Required — AI for briefings, story arcs, translation, chat
GEMINI_API_KEY=your_gemini_api_key

# Required — real news articles
NEWS_API_KEY=your_newsapi_key

# Optional — unused in current MVP
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=
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

## How the AI Works

All AI calls go through `lib/grok-ai.ts` → Gemini 2.0 Flash:

```
User action → Next.js API route → Gemini 2.0 Flash → JSON parsed → UI rendered
```

- **Briefing**: structured JSON prompt → 7-field briefing object
- **Story Arc**: structured JSON prompt → events + players + contrarian + predictions
- **Translation**: language-name prompt with cultural adaptation rules
- **Chat**: context-injected Q&A (full briefing/arc passed as context)
- **Search Intelligence**: headlines → sentiment + impact + themes summary

Fallback data is returned on any API failure so the UI never breaks.

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

## Pitch Video Script (3 min)

1. **0:00–0:30** — Problem: open ET homepage, show static one-size-fits-all layout
2. **0:30–1:00** — Onboarding: pick Investor + Markets/IPO + Hindi → "Open My ET"
3. **1:00–1:30** — Feed: real articles, sentiment badges, click "🧠 Deep Briefing"
4. **1:30–2:00** — Briefing: show all 7 sections, switch to Hindi, watch live translation
5. **2:00–2:30** — Chat: ask "What should an investor do right now?" → AI answers
6. **2:30–3:00** — Story Arc: search "Adani Group" → timeline + sentiment chart + predictions

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full agent diagram and system design.

## Impact Model

See [IMPACT.md](./IMPACT.md) for quantified business impact estimates.
