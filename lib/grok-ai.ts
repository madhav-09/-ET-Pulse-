import axios from "axios";
import { parseModelJson } from "@/lib/json";
import type { StoryArc } from "@/types";

// Google Gemini (free tier) — OpenAI-compatible endpoint
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GROK_API_KEY || "";
}

async function runGrokPrompt(prompt: string, maxTokens = 1500): Promise<string> {
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

export async function summarizeText(text: string) {
  if (!getApiKey()) {
    return `Missing GROK_API_KEY. Summary placeholder for: ${text.slice(0, 80)}...`;
  }
  try {
    return await runGrokPrompt(`Summarize this article in 5 bullet points:\n\n${text}`);
  } catch {
    return `Summary unavailable from provider. Quick summary: ${text.slice(0, 240)}...`;
  }
}

export async function createBriefing(topic: string) {
  if (!getApiKey()) {
    return {
      ...emptyBriefing,
      summary: `Missing GROK_API_KEY. Briefing placeholder for topic: ${topic}`,
    };
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
    const text = await runGrokPrompt(prompt, 2000);
    return parseModelJson<BriefingData>(text, {
      ...emptyBriefing,
      summary: text,
    });
  } catch {
    return {
      summary: `${topic}: multiple sources indicate active developments; review impact, players, and signals below.`,
      marketImpact: "Near-term volatility is likely while participants reprice risk and opportunity around this topic.",
      keyPlayers: [
        { name: "Policy Makers", role: "Set direction and regulatory clarity" },
        { name: "Market Participants", role: "Reallocate capital based on new signals" },
      ],
      sectorImpact: "Spillover can vary by sector exposure, debt profile, and sensitivity to policy or sentiment shifts.",
      timeline: [
        "Initial trigger event and first reactions",
        "Secondary clarifications and institutional commentary",
        "Emerging consensus and revised outlook",
      ],
      whatChanged: "The narrative shifted from headline reaction to second-order effects on margins, demand, and valuation.",
      watchSignals: [
        "Official policy notes and implementation dates",
        "Quarterly guidance updates",
        "Institutional flow trends",
      ],
    };
  }
}

export async function askFollowUp(question: string, context: string) {
  if (!getApiKey()) {
    return `Missing GEMINI_API_KEY. Please add a valid key in .env.local and restart the server. Q: ${question}`;
  }
  try {
    return await runGrokPrompt(`Context:\n${context}\n\nQuestion:\n${question}`);
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 429) {
      return "AI is currently rate-limited on the free Gemini tier (HTTP 429). Please wait 1-2 minutes and try again, or use a different API key/project with available quota.";
    }

    return `Provider unavailable right now. Based on current context, focus on: (1) policy timing, (2) margin and demand impact, (3) next quarterly guidance. Your question was: ${question}`;
  }
}

const fallbackStoryArc = (topic: string): StoryArc => ({
  events: [
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      headline: `${topic}: early policy and market reaction`,
      sentiment: "neutral",
      sentimentScore: 0.1,
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      headline: `${topic}: stakeholder statements and clarifications`,
      sentiment: "negative",
      sentimentScore: -0.2,
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      headline: `${topic}: revised outlook and recovery expectations`,
      sentiment: "positive",
      sentimentScore: 0.4,
    },
  ],
  players: [
    { name: "Government", role: "Policy direction and regulation" },
    { name: "Large Corporates", role: "Capital allocation and execution" },
    { name: "Retail Investors", role: "Sentiment and liquidity impact" },
  ],
  contrarian:
    "The market may be overpricing short-term noise while underpricing medium-term structural upside.",
  predictions: [
    "Track policy circulars and implementation timelines.",
    "Watch quarterly guidance changes by major players.",
    "Monitor institutional flows for confirmation.",
  ],
});

export async function buildStoryArc(topic: string) {
  if (!getApiKey()) {
    return fallbackStoryArc(topic);
  }

  try {
    const text = await runGrokPrompt(`Build a story arc tracker for this topic: ${topic}
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
    const result = await runGrokPrompt(prompt, 1500);
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
    const text = await runGrokPrompt(prompt, 800);
    const result = parseModelJson<SearchIntelligenceResult>(text, fallback);
    if (!["Positive", "Neutral", "Negative"].includes(result.sentiment)) result.sentiment = fallback.sentiment;
    if (!["High", "Medium", "Low"].includes(result.marketImpact)) result.marketImpact = fallback.marketImpact;
    if (!Number.isFinite(result.sentimentScore)) result.sentimentScore = fallback.sentimentScore;
    return result;
  } catch {
    return fallback;
  }
}