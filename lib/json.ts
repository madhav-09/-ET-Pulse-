export function extractJsonString(input: string): string {
  const fencedMatch = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = input.indexOf("{");
  const firstBracket = input.indexOf("[");
  const startCandidates = [firstBrace, firstBracket].filter((value) => value >= 0);

  if (startCandidates.length === 0) {
    return input.trim();
  }

  const start = Math.min(...startCandidates);
  const openChar = input[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;

  for (let index = start; index < input.length; index += 1) {
    const char = input[index];
    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return input.slice(start, index + 1).trim();
      }
    }
  }

  return input.slice(start).trim();
}

export function parseModelJson<T>(input: string, fallback: T): T {
  const jsonString = extractJsonString(input);
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}