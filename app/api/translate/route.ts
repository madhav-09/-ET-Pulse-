import { NextRequest } from "next/server";
import { translateText } from "@/lib/gemini-ai";
import { failure, isNonEmptyString, parseJsonBody, success } from "@/lib/route-utils";

const allowedLanguages = ["en", "hi", "ta", "te", "bn"];

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request) as { text?: unknown; language?: unknown } | null;
    const text = body?.text;
    const language = body?.language;

    if (!isNonEmptyString(text, 12000)) {
      return failure(400, "INVALID_TEXT", "text must be a non-empty string up to 12000 chars");
    }

    if (!isNonEmptyString(language, 20)) {
      return failure(400, "INVALID_LANGUAGE", "language must be a non-empty string");
    }

    if (!allowedLanguages.includes(language.toLowerCase())) {
      return failure(400, "UNSUPPORTED_LANGUAGE", "language must be one of en, hi, ta, te, bn");
    }

    const translation = await translateText(text, language);
    return success({ translation, language: language.toLowerCase() });
  } catch (error) {
    return failure(500, "TRANSLATE_FAILED", "Failed to translate text", String(error));
  }
}
