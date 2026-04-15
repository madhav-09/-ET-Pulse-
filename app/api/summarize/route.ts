import { NextRequest } from "next/server";
import { summarizeText } from "@/lib/gemini-ai";
import { failure, isNonEmptyString, parseJsonBody, success } from "@/lib/route-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const text = (body as { text?: unknown } | null)?.text;

    if (!isNonEmptyString(text, 12000)) {
      return failure(400, "INVALID_TEXT", "text must be a non-empty string up to 12000 chars");
    }

    const summary = await summarizeText(text);
    return success({ summary });
  } catch (error) {
    return failure(500, "SUMMARIZE_FAILED", "Failed to summarize", String(error));
  }
}
