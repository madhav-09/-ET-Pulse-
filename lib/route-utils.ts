import { NextRequest, NextResponse } from "next/server";

type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: ApiError;
};

export function success<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function failure(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: { code, message, details },
    },
    { status },
  );
}

export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

export function isNonEmptyString(value: unknown, maxLength = 20000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}