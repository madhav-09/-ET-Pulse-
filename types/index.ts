export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  sentiment: number;
  publishedAt: string;
  url?: string;
};

export type UserProfile = {
  id?: string;
  persona: "investor" | "founder" | "student" | "trader";
  topics: string[];
  language: "en" | "hi" | "ta" | "te" | "bn";
};

export type SupportedLanguage = "en" | "hi" | "ta" | "te" | "bn";

export type KeyPlayer = {
  name: string;
  role: string;
};

export type BriefingData = {
  summary: string;
  marketImpact: string;
  keyPlayers: KeyPlayer[];
  sectorImpact: string;
  timeline: string[];
  whatChanged: string;
  watchSignals: string[];
};

export type StoryArcEvent = {
  date: string;
  headline: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
};

export type StoryArcPlayer = {
  name: string;
  role: string;
};

export type StoryArc = {
  events: StoryArcEvent[];
  players: StoryArcPlayer[];
  contrarian: string;
  predictions: string[];
};

export type SearchIntelligence = {
  summary: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  sentimentScore: number;
  marketImpact: "High" | "Medium" | "Low";
  keyThemes: string[];
};
