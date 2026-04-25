import axios from "axios";
import { parseModelJson } from "@/lib/json";
import { fetchLatestNews } from "@/lib/news";
import type { StoryArc } from "@/types";

// Google Gemini (free tier) — OpenAI-compatible endpoint
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

function getApiKey() {
  return process.env.GEMINI_API_KEY || "";
}

async function runGeminiPrompt(prompt: string, maxTokens = 1500): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No AI API key configured");

  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        GEMINI_ENDPOINT,
        {
          model: "gemini-2.0-flash",
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.trim().length === 0) {
        throw new Error("EMPTY_AI_RESPONSE");
      }

      return content;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      // Retry on rate limit (429)
      if (status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`[AI] Rate limited (429), retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error(`[AI] Request failed (status=${status}):`, (error as Error).message);
      throw error;
    }
  }

  throw new Error("AI request failed after retries");
}

type BriefingData = {
  summary: string;
  marketImpact: string;
  keyPlayers: Array<{ name: string; role: string }>;
  sectorImpact: string;
  timeline: string[];
  whatChanged: string;
  watchSignals: string[];
};

const emptyBriefing: BriefingData = {
  summary: "",
  marketImpact: "",
  keyPlayers: [],
  sectorImpact: "",
  timeline: [],
  whatChanged: "",
  watchSignals: [],
};

function buildTopicAwareFallbackBriefing(topic: string): BriefingData {
  const lower = topic.toLowerCase();

  const isBudget = /budget|union budget|fiscal|tax|capex|subsidy/.test(lower);
  const isMarkets = /market|sensex|nifty|equity|stocks|ipo/.test(lower);
  const isTech = /tech|startup|ai|saas|digital|semiconductor/.test(lower);

  const keyPlayers = [
    { name: "Policy Makers", role: "Set direction and regulatory clarity" },
    { name: "Market Participants", role: "Reallocate capital based on new signals" },
  ];

  if (isBudget) {
    keyPlayers.push(
      { name: "Finance Ministry", role: "Defines fiscal priorities, tax policy, and spending allocation" },
      { name: "Sector Bodies", role: "Interpret budget measures and guide implementation narratives" },
    );
  }

  if (isTech) {
    keyPlayers.push({ name: "Growth-stage Startups", role: "Adjust hiring and expansion based on cost of capital" });
  }

  const marketImpact = isBudget
    ? "Near-term volatility is likely as participants reprice tax, capex, and deficit assumptions across sectors."
    : isMarkets
      ? "Positioning may shift quickly as participants react to earnings outlook, liquidity, and policy signals."
      : "Near-term volatility is likely while participants reprice risk and opportunity around this topic.";

  const sectorImpact = isBudget
    ? "Banks, infrastructure, consumption, and manufacturing are likely to diverge based on tax changes, capex quality, and subsidy design."
    : isTech
      ? "IT services, SaaS, fintech, and internet platforms may see different impacts based on demand durability and funding conditions."
      : "Spillover can vary by sector exposure, debt profile, and sensitivity to policy or sentiment shifts.";

  const whatChanged = isBudget
    ? "Focus shifted from headline announcements to implementation quality, fiscal math credibility, and second-order effects on margins and demand."
    : "The narrative shifted from headline reaction to second-order effects on margins, demand, and valuation.";

  const timeline = [
    "Initial trigger event and first reactions",
    "Secondary clarifications and institutional commentary",
    "Emerging consensus and revised outlook",
  ];

  const watchSignals = isBudget
    ? [
        "Official implementation circulars and effective dates",
        "Tax and duty impact on sector-level margins",
        "Government capex execution pace vs. target",
        "Management guidance updates in upcoming results",
        "Institutional flow rotation across cyclicals/defensives",
      ]
    : [
        "Official policy notes and implementation dates",
        "Quarterly guidance updates",
        "Institutional flow trends",
      ];

  return {
    summary: `${topic}: key developments are evolving quickly; prioritize implementation details, earnings sensitivity, and capital-flow confirmation before taking directional calls.`,
    marketImpact,
    keyPlayers,
    sectorImpact,
    timeline,
    whatChanged,
    watchSignals,
  };
}

async function buildNewsBackedFallbackBriefing(topic: string): Promise<BriefingData> {
  const base = buildTopicAwareFallbackBriefing(topic);

  try {
    const news = await fetchLatestNews(topic, "en", 6);
    if (!news.length) return base;

    const top = news.slice(0, 3);
    const avgSentiment = top.reduce((sum, item) => sum + item.sentiment, 0) / top.length;

    const sentimentView =
      avgSentiment >= 60
        ? "constructive"
        : avgSentiment <= 40
          ? "cautious"
          : "balanced";

    const sources = [...new Set(top.map((item) => item.source).filter(Boolean))];
    const sourceText = sources.length > 0 ? ` Sources tracking this include ${sources.join(", ")}.` : "";

    const keyPlayers = [
      ...base.keyPlayers,
      ...top.slice(0, 2).map((item) => ({
        name: item.source,
        role: "Influences narrative through recent coverage and framing",
      })),
    ].slice(0, 5);

    const timeline = top.map((item) => {
      const date = new Date(item.publishedAt);
      const safeDate = Number.isNaN(date.getTime()) ? "Recent" : date.toISOString().slice(0, 10);
      return `${safeDate}: ${item.title}`;
    });

    const watchSignals = [
      ...top.map((item) => `Follow-up coverage on: ${item.title.slice(0, 90)}`),
      ...base.watchSignals,
    ].slice(0, 5);

    return {
      ...base,
      summary: `${topic}: Recent coverage indicates a ${sentimentView} setup with focus on ${top
        .map((item) => item.title)
        .join("; ")}.${sourceText}`,
      marketImpact: `${base.marketImpact} News-flow sentiment currently skews ${sentimentView}.`,
      keyPlayers,
      sectorImpact: `${base.sectorImpact} Current headlines point to uneven impact across exposed sectors.`,
      timeline,
      whatChanged: `${base.whatChanged} The latest headline sequence suggests positioning is now driven by execution signals over announcements.`,
      watchSignals,
    };
  } catch {
    return base;
  }
}

export async function summarizeText(text: string) {
  if (!getApiKey()) {
    return `Missing GEMINI_API_KEY. Summary placeholder for: ${text.slice(0, 80)}...`;
  }
  try {
    return await runGeminiPrompt(`Summarize this article in 5 bullet points:\n\n${text}`);
  } catch {
    return `Summary unavailable from provider. Quick summary: ${text.slice(0, 240)}...`;
  }
}

export async function createBriefing(topic: string) {
  if (!getApiKey()) {
    return await buildNewsBackedFallbackBriefing(topic);
  }

  const prompt = `Create a detailed business-news briefing for: ${topic}
Return strict JSON only with keys:
summary, marketImpact, keyPlayers, sectorImpact, timeline, whatChanged, watchSignals
Rules:
- keyPlayers must be array of objects: {"name":"","role":""}
- timeline must be array of max 6 short strings
- watchSignals must be array of max 5 short strings
- Keep language concise and actionable.`;

  try {
    const text = await runGeminiPrompt(prompt, 2000);
    return parseModelJson<BriefingData>(text, {
      ...emptyBriefing,
      summary: text,
    });
  } catch {
    return await buildNewsBackedFallbackBriefing(topic);
  }
}

export async function askFollowUp(question: string, context: string) {
  if (!getApiKey()) {
    return `Missing GEMINI_API_KEY. Please add a valid key in .env.local and restart the server. Q: ${question}`;
  }
  try {
    return await runGeminiPrompt(`Context:\n${context}\n\nQuestion:\n${question}`);
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 429) {
      return "AI is currently rate-limited on the free Gemini tier (HTTP 429). Please wait 1-2 minutes and try again, or use a different API key/project with available quota.";
    }

    return `Provider unavailable right now. Based on current context, focus on: (1) policy timing, (2) margin and demand impact, (3) next quarterly guidance. Your question was: ${question}`;
  }
}

// ── Rich hardcoded story arcs per topic ──────────────────────────────────────
const HARDCODED_ARCS: Record<string, StoryArc> = {
  "zomato ipo": {
    events: [
      { date: "2021-04-23", headline: "Zomato files DRHP with SEBI for ₹8,250 crore IPO — India's first major food-tech listing", sentiment: "positive", sentimentScore: 0.7 },
      { date: "2021-07-14", headline: "IPO opens: subscribed 38× on final day; QIB portion booked 51×", sentiment: "positive", sentimentScore: 0.9 },
      { date: "2021-07-23", headline: "Zomato lists at ₹116 — 53% premium over ₹76 issue price; market cap crosses $12B", sentiment: "positive", sentimentScore: 0.95 },
      { date: "2021-11-16", headline: "Lock-in expiry triggers sell-off; stock falls 20% in two sessions as early investors exit", sentiment: "negative", sentimentScore: -0.6 },
      { date: "2022-07-27", headline: "Zomato hits all-time low of ₹40; analysts debate path to profitability amid cash burn", sentiment: "negative", sentimentScore: -0.8 },
      { date: "2023-08-03", headline: "Zomato reports first-ever quarterly profit of ₹2 crore; stock surges 15% intraday", sentiment: "positive", sentimentScore: 0.75 },
      { date: "2024-02-14", headline: "Zomato acquires Paytm's entertainment ticketing business for ₹2,048 crore", sentiment: "positive", sentimentScore: 0.6 },
      { date: "2024-09-10", headline: "Zomato rebrands to Eternal; quick commerce Blinkit now core growth driver", sentiment: "positive", sentimentScore: 0.65 },
    ],
    players: [
      { name: "Deepinder Goyal", role: "Co-founder & CEO — architect of IPO strategy and Blinkit pivot" },
      { name: "Info Edge", role: "Early backer; held ~18% pre-IPO, key anchor for retail confidence" },
      { name: "SoftBank / Ant Group", role: "Major pre-IPO investors; lock-in expiry triggered 2021 sell-off" },
      { name: "SEBI", role: "Regulator; scrutinised loss-making tech IPO disclosures" },
      { name: "Blinkit (Grofers)", role: "Acquired for $568M; now Zomato's highest-growth segment" },
    ],
    contrarian: "Zomato's re-rating from food delivery to quick-commerce platform is real, but Blinkit's unit economics depend on dark-store density that requires sustained capex. Profitability could compress again if Swiggy Instamart or Zepto accelerates discounting wars in top-10 cities.",
    predictions: [
      "Watch Blinkit's EBITDA margin trajectory — breakeven by FY26 is the key bull thesis",
      "Monitor Swiggy's post-IPO aggression in quick commerce for competitive pressure signals",
      "Track Eternal's B2B Hyperpure segment — next leg of revenue diversification",
      "SEBI's evolving framework for loss-making tech IPOs could affect future fundraising",
    ],
  },

  "adani group": {
    events: [
      { date: "2023-01-24", headline: "Hindenburg Research publishes 106-page short-seller report alleging stock manipulation and accounting fraud across Adani Group", sentiment: "negative", sentimentScore: -0.95 },
      { date: "2023-01-27", headline: "Adani Group stocks lose $48B in market cap in 3 days; FPO subscription in doubt", sentiment: "negative", sentimentScore: -0.9 },
      { date: "2023-02-01", headline: "Adani Enterprises withdraws ₹20,000 crore FPO citing 'volatile market conditions'", sentiment: "negative", sentimentScore: -0.85 },
      { date: "2023-03-02", headline: "GQG Partners invests $1.87B across four Adani stocks — first major institutional vote of confidence", sentiment: "positive", sentimentScore: 0.7 },
      { date: "2023-08-25", headline: "Supreme Court panel finds no regulatory failure; SEBI investigation ongoing", sentiment: "neutral", sentimentScore: 0.1 },
      { date: "2024-03-15", headline: "Adani Group fully repays $2.65B margin-linked loans ahead of schedule", sentiment: "positive", sentimentScore: 0.75 },
      { date: "2024-11-21", headline: "US DOJ indicts Gautam Adani over alleged $265M bribery scheme in solar contracts", sentiment: "negative", sentimentScore: -0.88 },
      { date: "2025-02-10", headline: "Adani Green, Adani Ports recover 40%+ from November lows as DOJ case details remain thin", sentiment: "positive", sentimentScore: 0.55 },
    ],
    players: [
      { name: "Gautam Adani", role: "Chairman — personally named in US DOJ indictment; central to group narrative" },
      { name: "Hindenburg Research", role: "Short-seller whose report triggered the largest single-week wealth destruction in Indian market history" },
      { name: "GQG Partners", role: "US fund manager; $1.87B counter-bet became the turning point for institutional confidence" },
      { name: "SEBI", role: "Under Supreme Court scrutiny for pace of investigation into Hindenburg allegations" },
      { name: "LIC & SBI", role: "Largest domestic institutional holders; their exposure made this a systemic risk question" },
    ],
    contrarian: "The Hindenburg report and DOJ indictment have permanently raised the governance risk premium on Adani stocks. However, the group's infrastructure assets — ports, airports, power transmission — are irreplaceable and cash-generative regardless of ownership optics. Long-term infrastructure investors may be underweighting asset quality while overweighting headline risk.",
    predictions: [
      "DOJ case resolution timeline is the single biggest re-rating catalyst — watch for plea deal or dismissal",
      "Adani Green's renewable energy pipeline (50GW by 2030) execution will determine FY26 earnings trajectory",
      "Monitor whether global index providers (MSCI, FTSE) adjust weightings post-DOJ developments",
      "Track LIC's quarterly disclosure of Adani exposure — any reduction signals institutional de-risking",
    ],
  },

  "jio financial services": {
    events: [
      { date: "2023-07-20", headline: "Reliance Industries demerges Jio Financial Services; shareholders get 1 JFS share per RIL share", sentiment: "positive", sentimentScore: 0.65 },
      { date: "2023-08-21", headline: "JFS lists at ₹265 on BSE; immediately enters price discovery with 5% lower circuit", sentiment: "neutral", sentimentScore: -0.1 },
      { date: "2023-10-05", headline: "JFS announces JV with BlackRock for asset management business targeting India's ₹50L crore mutual fund market", sentiment: "positive", sentimentScore: 0.8 },
      { date: "2024-01-18", headline: "Jio Finance app launches with home loans, insurance, and payments — direct challenge to HDFC and Bajaj Finance", sentiment: "positive", sentimentScore: 0.7 },
      { date: "2024-06-12", headline: "JFS stock hits ₹394; analysts debate whether NBFC valuation premium is justified without loan book", sentiment: "neutral", sentimentScore: 0.15 },
      { date: "2024-11-08", headline: "JFS reports Q2 FY25 PAT of ₹689 crore; loan book still nascent but insurance and payments growing", sentiment: "positive", sentimentScore: 0.5 },
    ],
    players: [
      { name: "Mukesh Ambani", role: "RIL Chairman; JFS is his bet on disrupting Indian financial services like Jio disrupted telecom" },
      { name: "BlackRock", role: "50:50 JV partner for asset management; brings global fund management credibility" },
      { name: "HDFC Bank / Bajaj Finance", role: "Incumbent NBFCs most threatened by JFS's distribution and data moat" },
      { name: "SEBI / RBI", role: "Dual regulators; JFS operates across securities and lending requiring both approvals" },
      { name: "Hitesh Sethia", role: "JFS CEO; tasked with building loan book and insurance distribution from scratch" },
    ],
    contrarian: "JFS trades at a significant premium to book value despite having minimal loan assets. The Jio distribution moat is real, but financial services require trust built over years — not just an app. Bajaj Finance took a decade to build its risk models. JFS's valuation assumes Jio-style disruption speed in a sector where regulatory capital requirements and credit cycles move much slower.",
    predictions: [
      "Watch JFS loan book growth — crossing ₹10,000 crore AUM is the first credibility milestone",
      "BlackRock JV AMC launch timeline and initial AUM will signal distribution effectiveness",
      "Monitor RBI's stance on JFS's payments bank and lending licenses",
      "Track whether JFS integrates with Jio's 450M subscriber base for credit scoring",
    ],
  },

  "union budget 2025": {
    events: [
      { date: "2025-01-15", headline: "Pre-budget expectations: industry lobbies for income tax relief, capex continuity, and PLI expansion", sentiment: "neutral", sentimentScore: 0.2 },
      { date: "2025-01-31", headline: "Economic Survey projects 6.4% GDP growth for FY26; flags global uncertainty and domestic consumption slowdown", sentiment: "neutral", sentimentScore: 0.1 },
      { date: "2025-02-01", headline: "FM Nirmala Sitharaman presents Budget 2025: zero tax up to ₹12L income, capex at ₹11.11L crore, fiscal deficit at 4.4%", sentiment: "positive", sentimentScore: 0.85 },
      { date: "2025-02-01", headline: "Markets surge 1.5% on budget day; FMCG, auto, and real estate stocks lead on consumption boost", sentiment: "positive", sentimentScore: 0.8 },
      { date: "2025-02-05", headline: "Analysts flag fiscal math concerns: disinvestment target of ₹47,000 crore seen as optimistic", sentiment: "negative", sentimentScore: -0.35 },
      { date: "2025-02-20", headline: "RBI cuts repo rate 25bps to 6.25% — first cut in 5 years, complementing budget's consumption push", sentiment: "positive", sentimentScore: 0.75 },
    ],
    players: [
      { name: "Nirmala Sitharaman", role: "Finance Minister — 8th consecutive budget; architect of ₹12L tax-free threshold" },
      { name: "RBI / Sanjay Malhotra", role: "New RBI Governor; coordinated rate cut with budget to amplify consumption stimulus" },
      { name: "FMCG & Auto Sector", role: "Primary beneficiaries of middle-class tax relief and rural consumption boost" },
      { name: "Infrastructure Contractors", role: "L&T, IRB, KNR — direct beneficiaries of ₹11.11L crore capex allocation" },
      { name: "FIIs", role: "Net sellers post-budget on fiscal deficit concerns; watched disinvestment credibility" },
    ],
    contrarian: "The ₹12L tax-free threshold is politically popular but fiscally expensive — the revenue foregone estimate of ₹1L crore assumes static behaviour. If consumption multiplier is lower than projected, the fiscal deficit could slip to 4.8%+ by Q3 FY26. Bond markets are already pricing in slippage risk with the 10-year yield staying elevated.",
    predictions: [
      "Track monthly GST collections — below ₹1.7L crore signals revenue stress",
      "Watch Q1 FY26 auto and FMCG volume data for consumption stimulus confirmation",
      "Monitor disinvestment progress — LIC stake sale and BPCL privatisation are key milestones",
      "RBI's next MPC meeting: another 25bps cut would confirm coordinated easing cycle",
    ],
  },

  "rbi rate decision": {
    events: [
      { date: "2023-04-06", headline: "RBI holds repo rate at 6.5% — pause after 250bps of hikes since May 2022", sentiment: "positive", sentimentScore: 0.5 },
      { date: "2023-10-06", headline: "RBI holds again; Governor Das warns of 'elephant in the room' — sticky food inflation above 6%", sentiment: "neutral", sentimentScore: -0.1 },
      { date: "2024-04-05", headline: "RBI holds for 7th consecutive meeting; GDP forecast raised to 7% for FY25", sentiment: "positive", sentimentScore: 0.4 },
      { date: "2024-12-06", headline: "Sanjay Malhotra replaces Shaktikanta Das as RBI Governor — policy continuity expected", sentiment: "neutral", sentimentScore: 0.05 },
      { date: "2025-02-07", headline: "RBI cuts repo rate 25bps to 6.25% — first cut since May 2020; signals easing cycle has begun", sentiment: "positive", sentimentScore: 0.8 },
      { date: "2025-04-09", headline: "RBI cuts again by 25bps to 6.0%; GDP growth forecast trimmed to 6.5% citing global trade uncertainty", sentiment: "positive", sentimentScore: 0.6 },
    ],
    players: [
      { name: "Sanjay Malhotra", role: "RBI Governor since Dec 2024; initiated easing cycle faster than markets expected" },
      { name: "MPC Members", role: "6-member committee; external members have been more dovish than RBI staff" },
      { name: "Banks (HDFC, SBI, ICICI)", role: "Transmission agents — speed of rate cut pass-through to borrowers is key" },
      { name: "Finance Ministry", role: "Coordinated fiscal-monetary policy; budget consumption push aligned with rate cuts" },
      { name: "FIIs", role: "Rate differential with US Fed drives INR and capital flow dynamics" },
    ],
    contrarian: "Two rate cuts in quick succession signal RBI is prioritising growth over inflation vigilance. With food inflation still volatile and the US Fed on hold, the INR faces depreciation pressure. A weaker rupee imports inflation — potentially forcing RBI to pause the easing cycle earlier than the market's priced-in 100bps of cuts.",
    predictions: [
      "Watch CPI inflation prints — sustained above 5% would pause the easing cycle",
      "Monitor INR/USD — depreciation below 87 would test RBI's tolerance",
      "Track bank lending rate transmission — MCLR cuts lagging repo cuts is a key risk",
      "US Fed's rate path is the external variable — any Fed hike reverses RBI's room",
    ],
  },

  "india gdp growth": {
    events: [
      { date: "2024-05-31", headline: "India's FY24 GDP growth revised to 8.2% — fastest among major economies; beats China's 5.2%", sentiment: "positive", sentimentScore: 0.85 },
      { date: "2024-08-30", headline: "Q1 FY25 GDP at 6.7% — slowdown from 8.2%; private consumption and manufacturing disappoint", sentiment: "negative", sentimentScore: -0.4 },
      { date: "2024-11-29", headline: "Q2 FY25 GDP shocks at 5.4% — 7-quarter low; urban consumption and corporate margins under pressure", sentiment: "negative", sentimentScore: -0.7 },
      { date: "2025-01-31", headline: "Economic Survey projects 6.4% for FY26; flags need for private capex revival and export diversification", sentiment: "neutral", sentimentScore: 0.1 },
      { date: "2025-02-28", headline: "Q3 FY25 GDP recovers to 6.2%; government capex and rural demand lead the bounce", sentiment: "positive", sentimentScore: 0.55 },
    ],
    players: [
      { name: "Finance Ministry / CEA", role: "V. Anantha Nageswaran leads economic narrative; manages growth-inflation trade-off messaging" },
      { name: "RBI", role: "Rate cuts aimed at reviving private investment and consumption demand" },
      { name: "Private Sector Capex", role: "Missing link — corporate India sitting on cash but not investing; key to sustaining 7%+ growth" },
      { name: "IMF / World Bank", role: "External validators; India remains their top-ranked large economy growth forecast" },
      { name: "State Governments", role: "Capex execution quality varies widely; UP, Gujarat, Maharashtra drive bulk of infrastructure spend" },
    ],
    contrarian: "India's 8%+ growth in FY24 was partly a statistical base effect and government capex surge. The Q2 FY25 shock at 5.4% revealed that private consumption — 60% of GDP — is under stress from K-shaped recovery dynamics. Premium consumption is booming while mass-market demand stagnates. Sustaining 7%+ requires private capex revival that hasn't materialised despite 3 years of corporate balance sheet repair.",
    predictions: [
      "Q4 FY25 GDP print (May 2025) — needs to show 6.5%+ to restore confidence in FY26 trajectory",
      "Private capex announcements in Q1 FY26 earnings calls are the leading indicator",
      "Monitor rural wage growth and FMCG volume data for mass consumption recovery signals",
      "US tariff escalation impact on IT services exports — $250B sector is a GDP swing factor",
    ],
  },
};

function getHardcodedArc(topic: string): StoryArc | null {
  const key = topic.toLowerCase().trim();
  // exact match
  if (HARDCODED_ARCS[key]) return HARDCODED_ARCS[key];
  // partial match
  for (const k of Object.keys(HARDCODED_ARCS)) {
    if (key.includes(k) || k.includes(key)) return HARDCODED_ARCS[k];
  }
  return null;
}

const fallbackStoryArc = (topic: string): StoryArc => {
  const hardcoded = getHardcodedArc(topic);
  if (hardcoded) return hardcoded;

  // generic fallback only if no match
  const lower = topic.toLowerCase();
  const isIPO = /ipo|listing|issue price/.test(lower);
  const isBudget = /budget|fiscal|tax/.test(lower);
  const isBank = /rbi|rate|repo|bank|npa/.test(lower);

  return {
    events: [
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        headline: isIPO ? `${topic}: DRHP filed, issue size and price band announced` : isBudget ? `${topic}: pre-announcement expectations and sector positioning` : `${topic}: initial developments and market positioning`,
        sentiment: "neutral",
        sentimentScore: 0.2,
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
        headline: isIPO ? `${topic}: subscription opens — institutional demand strong, retail cautious` : isBudget ? `${topic}: announcement triggers sector-specific reactions` : `${topic}: stakeholder responses and analyst commentary`,
        sentiment: "positive",
        sentimentScore: 0.55,
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        headline: isIPO ? `${topic}: listing day — premium or discount sets near-term narrative` : isBank ? `${topic}: transmission to lending rates and credit growth impact` : `${topic}: implementation details emerge, second-order effects debated`,
        sentiment: "neutral",
        sentimentScore: -0.1,
      },
      {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        headline: `${topic}: revised outlook as data and execution signals accumulate`,
        sentiment: "positive",
        sentimentScore: 0.45,
      },
    ],
    players: [
      { name: "SEBI", role: "Regulatory oversight and disclosure enforcement" },
      { name: "Institutional Investors (FII/DII)", role: "Price discovery and liquidity provision" },
      { name: "Retail Investors", role: "Sentiment indicator and subscription demand" },
      { name: "Finance Ministry", role: "Policy direction and fiscal framework" },
    ],
    contrarian: `The consensus view on ${topic} may be missing second-order effects. Markets tend to overprice near-term catalysts and underprice structural execution risk. Watch for divergence between headline announcements and ground-level implementation data over the next two quarters.`,
    predictions: [
      `Monitor quarterly earnings guidance for ${topic.split(" ")[0]} sector companies`,
      "Track institutional flow data — FII vs DII divergence signals conviction level",
      "Watch for SEBI or RBI regulatory responses that could reshape the narrative",
      "Follow management commentary in next earnings call for forward guidance",
    ],
  };
};

export async function buildStoryArc(topic: string) {
  if (!getApiKey()) {
    return fallbackStoryArc(topic);
  }

  try {
    const text = await runGeminiPrompt(`Build a story arc tracker for this topic: ${topic}
Return strict JSON only with keys:
events, players, contrarian, predictions
Rules:
- events: array of max 8 objects with fields date(ISO string), headline, sentiment(positive|neutral|negative), sentimentScore(number from -1 to 1)
- players: array of max 6 objects with fields name, role
- contrarian: one concise paragraph
- predictions: array of 3 to 5 short actionable bullet strings`);

    const arc = parseModelJson<StoryArc>(text, fallbackStoryArc(topic));

    return {
      ...arc,
      events: arc.events.map((event) => ({
        ...event,
        sentiment: ["positive", "neutral", "negative"].includes(event.sentiment)
          ? event.sentiment
          : "neutral",
        sentimentScore: Number.isFinite(event.sentimentScore)
          ? Math.max(-1, Math.min(1, event.sentimentScore))
          : 0,
      })),
    };
  } catch {
    return fallbackStoryArc(topic);
  }
}

const languageNames: Record<string, string> = {
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  en: "English",
};

export async function translateText(text: string, language: string) {
  if (!getApiKey()) return text;
  if (language === "en") return text;
  if (!text.trim()) return text;

  const langName = languageNames[language] ?? language;

  const prompt = `You are a professional translator. Your ONLY task is to translate the text below into ${langName}.

RULES:
- Output ONLY the translated text in ${langName} script. Do NOT include any English text.
- Do NOT add any explanations, notes, or commentary.
- Use natural, culturally adapted ${langName} — not word-by-word literal translation.
- Preserve all numbers, proper nouns (company names, people names), and financial terms as-is.
- The output must be entirely in ${langName} script (e.g., Devanagari for Hindi, Tamil script for Tamil, etc.)

TEXT TO TRANSLATE:
${text}

TRANSLATION IN ${langName.toUpperCase()}:`;

  try {
    const result = await runGeminiPrompt(prompt, 1500);
    // If the model returned empty or the exact same text, return original
    if (!result.trim() || result.trim() === text.trim()) {
      console.warn(`[translate] Translation returned same text for language=${language}`);
      return text;
    }
    return result.trim();
  } catch (error) {
    console.error(`[translate] Failed for language=${language}:`, error);
    return text;
  }
}

type SearchIntelligenceResult = {
  summary: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  sentimentScore: number;
  marketImpact: "High" | "Medium" | "Low";
  keyThemes: string[];
};

export async function generateSearchIntelligence(
  topic: string,
  news: Array<{ title: string; summary: string; sentiment: number }>,
): Promise<SearchIntelligenceResult> {
  const avgSentiment =
    news.length > 0 ? news.reduce((sum, n) => sum + n.sentiment, 0) / news.length : 50;

  const fallback: SearchIntelligenceResult = {
    summary: `${topic} is currently an active topic in business and financial markets. Multiple news sources are covering developments, with implications for investors and market participants.`,
    sentiment: avgSentiment > 60 ? "Positive" : avgSentiment < 40 ? "Negative" : "Neutral",
    sentimentScore: Math.round(((avgSentiment - 50) / 50) * 100) / 100,
    marketImpact: "Medium",
    keyThemes: ["Market dynamics", "Industry developments", "Investor sentiment"],
  };

  if (!getApiKey()) return fallback;

  const headlines = news.map((n) => `- ${n.title}`).join("\n");

  const prompt = `You are a financial intelligence analyst. Analyze this topic: "${topic}"
Recent news headlines:
${headlines}

Return strict JSON only with these keys:
- summary: A concise 3-4 sentence intelligence overview. Be specific and actionable.
- sentiment: exactly one of "Positive", "Neutral", or "Negative"
- sentimentScore: number from -1 to 1
- marketImpact: exactly one of "High", "Medium", or "Low"
- keyThemes: array of 3-5 short theme strings`;

  try {
    const text = await runGeminiPrompt(prompt, 800);
    const result = parseModelJson<SearchIntelligenceResult>(text, fallback);
    if (!["Positive", "Neutral", "Negative"].includes(result.sentiment)) result.sentiment = fallback.sentiment;
    if (!["High", "Medium", "Low"].includes(result.marketImpact)) result.marketImpact = fallback.marketImpact;
    if (!Number.isFinite(result.sentimentScore)) result.sentimentScore = fallback.sentimentScore;
    return result;
  } catch {
    return fallback;
  }
}