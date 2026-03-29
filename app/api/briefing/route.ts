import { NextRequest } from "next/server";
import { createBriefing } from "@/lib/grok-ai";
import { failure, isNonEmptyString, parseJsonBody, success } from "@/lib/route-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const topic = (body as { topic?: unknown } | null)?.topic;
    if (!isNonEmptyString(topic, 300)) {
      return failure(400, "INVALID_TOPIC", "topic must be a non-empty string up to 300 chars");
    }

    const briefing = await createBriefing(topic);
    return success({ briefing });
  } catch (error) {
    return failure(500, "BRIEFING_FAILED", "Failed to create briefing", String(error));
  }
}
