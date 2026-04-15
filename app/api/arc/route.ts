import { NextRequest } from "next/server";
import { buildStoryArc } from "@/lib/gemini-ai";
import { failure, isNonEmptyString, parseJsonBody, success } from "@/lib/route-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request) as { topic?: unknown; language?: unknown } | null;
    const topic = body?.topic;
    const language = body?.language;

    if (!isNonEmptyString(topic, 200)) {
      return failure(400, "INVALID_TOPIC", "topic must be a non-empty string up to 200 chars");
    }

    if (language !== undefined && !isNonEmptyString(language, 20)) {
      return failure(400, "INVALID_LANGUAGE", "language must be a non-empty string when provided");
    }

    const arc = await buildStoryArc(topic);
    return success({ arc, meta: { topic, language: language ?? "en" } });
  } catch (error) {
    return failure(500, "ARC_FAILED", "Failed to build story arc", String(error));
  }
}
