import { fetchLatestNews } from "@/lib/grok";
import { buildStoryArc, generateSearchIntelligence } from "@/lib/grok-ai";
import { failure, success } from "@/lib/route-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length === 0) {
      return failure(400, "INVALID_QUERY", "q parameter is required");
    }
    if (query.length > 200) {
      return failure(400, "QUERY_TOO_LONG", "query must be 200 characters or less");
    }

    const [news, arc] = await Promise.all([
      fetchLatestNews(query, "en", 8),
      buildStoryArc(query),
    ]);

    const intelligence = await generateSearchIntelligence(query, news);

    return success({ query, news, intelligence, arc });
  } catch (error) {
    return failure(500, "SEARCH_FAILED", "Failed to generate search intelligence", String(error));
  }
}
