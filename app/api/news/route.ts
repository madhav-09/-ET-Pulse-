import { fetchLatestNews } from "@/lib/news";
import { translateText } from "@/lib/gemini-ai";
import { failure, success } from "@/lib/route-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic")?.trim() ?? "Indian business";
    const language = searchParams.get("language")?.trim() ?? "en";
    const limitRaw = Number(searchParams.get("limit") ?? "6");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 12) : 6;

    if (!topic) {
      return failure(400, "INVALID_TOPIC", "topic must be a non-empty string");
    }

    if (!language) {
      return failure(400, "INVALID_LANGUAGE", "language must be a non-empty string");
    }

    const news = await fetchLatestNews(topic, language, limit);

    // Translate news items when language is not English
    if (language !== "en") {
      const translated = await Promise.all(
        news.map(async (item) => {
          const [title, summary] = await Promise.all([
            translateText(item.title, language),
            translateText(item.summary, language),
          ]);
          return { ...item, title, summary };
        }),
      );
      return success({ news: translated, meta: { topic, language, limit } });
    }

    return success({ news, meta: { topic, language, limit } });
  } catch (error) {
    return failure(500, "NEWS_FETCH_FAILED", "Failed to fetch news", String(error));
  }
}
