import { NextRequest } from "next/server";
import { askFollowUp } from "@/lib/gemini-ai";
import { failure, isNonEmptyString, parseJsonBody, success } from "@/lib/route-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request) as { question?: unknown; context?: unknown } | null;
    const question = body?.question;
    const context = body?.context;

    if (!isNonEmptyString(question, 2000)) {
      return failure(400, "INVALID_QUESTION", "question must be a non-empty string up to 2000 chars");
    }

    if (context !== undefined && !isNonEmptyString(context, 30000)) {
      return failure(400, "INVALID_CONTEXT", "context must be a non-empty string up to 30000 chars when provided");
    }

    const answer = await askFollowUp(question, context ?? "");
    return success({ answer });
  } catch (error) {
    return failure(500, "CHAT_FAILED", "Failed to answer follow-up", String(error));
  }
}
