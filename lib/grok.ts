import axios from "axios";

const sentimentToScore: Record<string, number> = {
  positive: 75,
  neutral: 50,
  negative: 25,
};

type NewsApiArticle = {
  title?: string;
  description?: string;
  source?: { name?: string };
  publishedAt?: string;
  url?: string;
};

function scoreSentiment(text: string): number {
  const lower = text.toLowerCase();
  const pos = ["surge", "gain", "rise", "growth", "profit", "rally", "boost", "record", "strong", "beat"];
  const neg = ["fall", "drop", "loss", "decline", "crash", "weak", "miss", "cut", "risk", "concern"];
  let score = 0;
  for (const w of pos) if (lower.includes(w)) score++;
  for (const w of neg) if (lower.includes(w)) score--;
  if (score > 0) return sentimentToScore.positive;
  if (score < 0) return sentimentToScore.negative;
  return sentimentToScore.neutral;
}

function fallbackNews(topic: string, limit: number) {
  const now = Date.now();
  return [
    {
      id: "1",
      title: `${topic}: market reaction and analyst outlook`,
      summary: `Key developments in ${topic} with focus on impact, momentum, and what investors should watch next.`,
      source: "ET Pulse",
      sentiment: 58,
      publishedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      url: "",
    },
    {
      id: "2",
      title: `${topic}: policy signals and business implications`,
      summary: `Regulatory direction and sector-level ripple effects summarized for fast decision making.`,
      source: "ET Pulse",
      sentiment: 50,
      publishedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      url: "",
    },
    {
      id: "3",
      title: `${topic}: key players, risks, and watch signals`,
      summary: `Who gains, who faces pressure, and the next indicators likely to move this story.`,
      source: "ET Pulse",
      sentiment: 42,
      publishedAt: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
      url: "",
    },
  ].slice(0, limit);
}

export async function fetchLatestNews(topic: string, language = "en", limit = 6) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return fallbackNews(topic, limit);

  try {
    const languageHint = language !== "en" ? ` ${language}` : "";
    const query = `${topic} India business${languageHint}`;
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        language: "en",
        sortBy: "publishedAt",
        pageSize: limit,
        apiKey,
      },
    });

    const articles: NewsApiArticle[] = response.data?.articles ?? [];
    if (articles.length === 0) return fallbackNews(topic, limit);

    return articles.map((article, index) => {
      const text = `${article.title ?? ""} ${article.description ?? ""}`;
      return {
        id: String(index + 1),
        title: article.title ?? "Untitled story",
        summary: article.description ?? "No summary available.",
        source: article.source?.name ?? "Unknown source",
        sentiment: scoreSentiment(text),
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        url: article.url ?? "",
      };
    });
  } catch {
    return fallbackNews(topic, limit);
  }
}
