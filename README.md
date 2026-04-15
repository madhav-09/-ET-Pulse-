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

### Quick Start (Local Development)

```bash
git clone https://github.com/madhav-09/-ET-Pulse-.git
cd et-pulse
npm install
```

### Environment Variables

Create `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key      # Get from https://aistudio.google.com/app/apikey
NEWS_API_KEY=your_newsapi_key           # Get from https://newsapi.org/register
```

### Run Locally

**Development mode:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Production mode:**
```bash
npm run build
npm start
```

---

## Architecture

ET Pulse is a **microservices-based application** designed for scalability and cost-efficiency:

### Services

| Service | Port | Responsibility |
|---------|------|-----------------|
| **Web Gateway** | 3000 | Next.js UI + BFF (lightweight API proxy) |
| **Intelligence API** | 4001 | AI processing (Gemini briefing, chat, translation, arc builder) |
| **News API** | 4002 | News fetching + in-memory caching layer |

### Data Flow

```
User → Web Gateway (port 3000)
         ├→ Intelligence API (4001)  [Gemini AI processing]
         └→ News API (4002)          [NewsAPI + cache]
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design and retry logic.

---

## Docker & Local Orchestration

### Run All Services with Docker Compose

```bash
# Ensure .env.local is present with API keys
docker-compose up --build

# Test services
curl http://localhost:3000            # Web Gateway
curl http://localhost:4001/health     # Intelligence API
curl http://localhost:4002/health     # News API
curl http://localhost:4002/news?topic=tech  # News with caching

# Stop all services
docker-compose down
```

Services communicate via internal Docker network (`et-pulse-network`). Each service:
- Runs in a lightweight Alpine container
- Has health checks enabled (30s intervals)
- Auto-restarts on failure
- Logs to stdout/stderr for easy monitoring

See [docker-compose.yml](docker-compose.yml) for full configuration.

---

## CI/CD Pipeline

Automated testing, building, and deployment via **GitHub Actions** (see [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)):

### Workflow

| Stage | Trigger | Action |
|-------|---------|--------|
| **Lint & Test** | PR + push | ESLint, build all services, cache deps |
| **SonarCloud Scan** | All events | Code quality + security analysis (free for public repos) |
| **Build Images** | Push to main/develop | Build 3 Docker images → push to GitHub Container Registry |
| **Trivy Scan** | After build | Scan for HIGH/CRITICAL CVEs → fail if found |
| **Deploy to EC2** | Push to main only | SSH pull → docker-compose up on EC2 |

### Setup

Add GitHub repository secrets in **Settings → Secrets**:
- `SONAR_TOKEN` — SonarCloud authentication
- `EC2_HOST` — EC2 instance IP
- `EC2_USER` — SSH user (e.g., ubuntu)
- `EC2_SSH_KEY` — EC2 private SSH key

### Cost

- **GitHub Actions**: 2,000 mins/month (free)
- **Container Registry**: Free storage
- **SonarCloud**: Free for public repos
- **Trivy**: Free open-source

---

## Infrastructure & Deployment (Terraform)

ET Pulse infrastructure is defined as code using **Terraform** for reproducible, free-tier AWS deployment.

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup guide.

### Quick Start

```bash
cd infra
terraform init
terraform plan
terraform apply
```

This provisions:
- **EC2 instance (t3.micro)**: Free tier eligible, auto-installs Docker + Docker Compose
- **Security Group**: Ports 22 (SSH), 80 (HTTP), 3000 (Web Gateway), 443 (HTTPS)
- **Key Pair**: SSH access management

### Outputs

After `terraform apply`, you get:
- EC2 public IP → Application URL: `http://<IP>:3000`
- SSH command → Direct instance access
- Instance ID → For monitoring/updates

### Cleanup

```bash
terraform destroy  # Stops all resources + billing
```

---

## Production Readiness

**Before launching to production, review [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md).**

Includes security, deployment, reliability, and performance verification steps. ✅ Status: **Production-ready for MVP** (< 3k DAU).

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

## Pitch Deck

📊 [ET_Pulse_Hackathon.pptx](./ET_Pulse_Hackathon.pptx) — 7-slide hackathon presentation

---

*Built by Team AAM_MUNDE · Madhav Tiwari · GATE 2026 (CS) · AWS Certified Cloud Practitioner*
*tiwarimadhav2309@gmail.com · +91-9374105274 · [linkedin.com/in/madhav-tiwari2309](https://linkedin.com/in/madhav-tiwari2309) · [github.com/madhav-09](https://github.com/madhav-09)*
