# ET Pulse — Architecture Document

## System Overview

ET Pulse is a Next.js 16 App Router application with a thin server layer (API routes) and a rich client layer (React components). All AI intelligence is routed through a single abstraction (`lib/grok-ai.ts`) backed by Google Gemini 2.0 Flash. News data comes from NewsAPI.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                            │
│                                                                     │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │ /        │  │ /feed      │  │ /briefing │  │ /story         │  │
│  │Onboarding│  │My ET Feed  │  │Deep Brief │  │Story Arc       │  │
│  │3-step    │  │NewsCard ×N │  │+ChatBox   │  │Timeline+Chart  │  │
│  │localStorage  LanguageToggle LanguageToggle  SentimentChart  │  │
│  └──────────┘  └────────────┘  └───────────┘  └────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /search — Intelligence Search                                │  │
│  │ SearchBar (nav, ⌘K) → /search?q= → AI Summary + Arc + Chat  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ fetch() — JSON over HTTPS
┌───────────────────────────────▼─────────────────────────────────────┐
│                    NEXT.JS SERVER (API Routes)                       │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ GET /api/news   │  │ POST /api/brief  │  │ POST /api/arc    │   │
│  │ NewsAPI fetch   │  │ Gemini briefing  │  │ Gemini story arc │   │
│  │ + sentiment     │  │ 7-field JSON     │  │ events+players   │   │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘   │
│           │                   │                      │              │
│  ┌────────▼────────┐  ┌───────▼──────────┐  ┌───────▼──────────┐  │
│  │ GET /api/search │  │ POST /api/chat   │  │ POST /api/trans  │  │
│  │ news+arc+intel  │  │ Gemini Q&A       │  │ Gemini translate │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                   │                      │             │
│           └───────────────────┼──────────────────────┘             │
│                               │                                     │
│              ┌────────────────▼──────────────────┐                 │
│              │         lib/grok-ai.ts             │                 │
│              │   runGrokPrompt() — single entry   │                 │
│              │   point for all Gemini calls       │                 │
│              │   • retry on 429 (3x, exp backoff) │                 │
│              │   • timeout: 30s                   │                 │
│              │   • fallback data on any failure   │                 │
│              └────────────────┬──────────────────┘                 │
└───────────────────────────────┼─────────────────────────────────────┘
                                │ HTTPS POST
┌───────────────────────────────▼─────────────────────────────────────┐
│              EXTERNAL SERVICES                                       │
│                                                                      │
│  ┌──────────────────────────────────┐  ┌──────────────────────────┐ │
│  │ Google Gemini 2.0 Flash          │  │ NewsAPI                  │ │
│  │ generativelanguage.googleapis.com│  │ newsapi.org/v2/everything│ │
│  │ OpenAI-compatible endpoint       │  │ Real-time articles       │ │
│  │ Free tier: 15 RPM / 1M TPD       │  │ Free tier: 100 req/day   │ │
│  └──────────────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Roles

ET Pulse uses a **single AI model (Gemini 2.0 Flash)** acting as multiple specialized agents depending on the prompt context. Each agent is a distinct function in `lib/grok-ai.ts`:

### Agent 1 — Briefing Synthesizer (`createBriefing`)
- **Input**: Topic string (e.g. "Union Budget 2025")
- **Task**: Synthesize a structured 7-field intelligence briefing
- **Output**: `{ summary, marketImpact, keyPlayers[], sectorImpact, timeline[], whatChanged, watchSignals[] }`
- **Prompt strategy**: Strict JSON schema enforcement, concise + actionable language
- **Token budget**: 2000 max tokens

### Agent 2 — Story Arc Builder (`buildStoryArc`)
- **Input**: Topic string
- **Task**: Build a complete narrative arc with timeline events, players, contrarian view, predictions
- **Output**: `{ events[], players[], contrarian, predictions[] }`
- **Prompt strategy**: ISO date enforcement, sentiment enum validation, score clamping to [-1, 1]
- **Token budget**: 1500 max tokens

### Agent 3 — Follow-up Chat (`askFollowUp`)
- **Input**: User question + full briefing/arc context (JSON stringified)
- **Task**: Answer questions grounded in the current briefing context
- **Output**: Plain text answer
- **Prompt strategy**: Context-first injection, language-aware response
- **Token budget**: 1500 max tokens

### Agent 4 — Vernacular Translator (`translateText`)
- **Input**: English text + target language code
- **Task**: Culturally adapted translation (not literal)
- **Output**: Translated text in target script
- **Prompt strategy**: Explicit rules — output ONLY target language, preserve numbers/names/financial terms, use natural script
- **Languages**: Hindi (Devanagari), Tamil, Telugu, Bengali
- **Token budget**: 1500 max tokens

### Agent 5 — Search Intelligence (`generateSearchIntelligence`)
- **Input**: Query + array of news headlines
- **Task**: Generate intelligence summary, sentiment score, market impact rating, key themes
- **Output**: `{ summary, sentiment, sentimentScore, marketImpact, keyThemes[] }`
- **Prompt strategy**: Financial analyst persona, strict enum outputs, validated post-parse
- **Token budget**: 800 max tokens

---

## Data Flow — Deep Briefing (most complex path)

```
User types topic → form submit
  → setTopic() + loadBriefing(topic)
    → POST /api/briefing { topic }
      → createBriefing(topic) [Gemini]
        → runGrokPrompt(prompt, 2000)
          → Gemini API (HTTPS POST)
          ← raw text response
        → parseModelJson() [extract JSON from markdown/text]
      ← BriefingData object
    ← { ok: true, data: { briefing } }
  → setBaseBriefing(briefing)
  → if language !== "en":
      → translateChunk() × 6 fields [parallel Promise.all]
        → POST /api/translate × 6
          → translateText(text, language) [Gemini]
      → setDisplayBriefing(translated)
  → BriefingPanel renders
  → ChatBox ready with context = JSON.stringify({ topic, language, briefing })
```

---

## Tool Integrations

| Tool | Purpose | Key | Fallback |
|------|---------|-----|---------|
| Google Gemini 2.0 Flash | All AI intelligence | `GEMINI_API_KEY` | Hardcoded fallback data |
| NewsAPI | Real news articles | `NEWS_API_KEY` | 3 static placeholder articles |
| localStorage | User profile persistence | — | None needed |
| Recharts | Sentiment trend chart | — | Hidden if no data |
| Lucide React | Icons | — | — |

---

## Error Handling Logic

### API Layer (`lib/route-utils.ts`)
Every API route returns a typed `{ ok: true, data }` or `{ ok: false, error: { code, message } }`. HTTP status codes are always set correctly.

### AI Retry Logic (`lib/grok-ai.ts` — `runGrokPrompt`)
```
attempt 0 → Gemini API call
  → 429 (rate limit): wait 2s, retry
attempt 1 → retry
  → 429: wait 4s, retry
attempt 2 → retry
  → 429: wait 8s, retry
attempt 3 → throw error → caught by caller → return fallback data
```

### Fallback Data Strategy
Every AI function has a hardcoded fallback:
- `createBriefing` → returns a generic but coherent briefing structure
- `buildStoryArc` → returns 3 generic events with realistic sentiment arc
- `translateText` → returns original English text unchanged
- `fetchLatestNews` → returns 3 topic-relevant placeholder articles
- `generateSearchIntelligence` → returns average-sentiment fallback

### Client-Side Error Handling
- All pages use `ErrorState` component with a **Retry** button
- Loading states use shimmer skeletons (never blank screens)
- Language toggle failures show original English content

### JSON Parsing (`lib/json.ts`)
AI responses often wrap JSON in markdown code fences. `parseModelJson()`:
1. Strips ` ```json ` fences
2. Finds first `{` or `[` and extracts balanced JSON
3. Falls back to provided default on parse failure

---

## Security Notes

- All API keys are server-side only (Next.js API routes, never exposed to client)
- Input validation on all API routes: length limits, type checks, enum validation
- No user data stored server-side — profile is localStorage only
- CORS handled by Next.js defaults

---

## Scalability Path

| Current (MVP) | Production |
|---|---|
| localStorage profile | Supabase / Postgres user table |
| NewsAPI free tier | ET's own content API |
| Gemini free tier | Gemini Pro / paid tier with higher RPM |
| Single Gemini model | Specialized models per agent |
| No caching | Redis cache for briefings (TTL: 1hr) |
| No auth | NextAuth.js / Clerk |
