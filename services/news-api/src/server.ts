import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const app = express();
const port = Number(process.env.PORT || 4002);
const cacheTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 60);

// Trust proxy - required for correct IP detection behind Nginx
app.set("trust proxy", 1);

// Request logging middleware (lightweight, no sensitive data)
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log only: method, path (sanitized), status, duration
    console.log(`${req.method} ${req.path.split("?")[0]} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Helper: Check if request is from internal/local network
const isInternalRequest = (req: Request): boolean => {
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "";
  // Skip rate limiting for localhost and Docker internal IPs
  return (
    clientIp === "127.0.0.1" ||
    clientIp === "::1" ||
    clientIp.startsWith("172.") ||
    clientIp.startsWith("10.") ||
    clientIp === "::ffff:127.0.0.1"
  );
};

// Rate limiting: 100 requests per 15 minutes per IP (public only)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || isInternalRequest(req),
  keyGenerator: (req) => {
    return (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "unknown";
  },
});

// Apply rate limiting to all routes except /health and internal calls
app.use((req: Request, res: Response, next) => {
  if (req.path === "/health" || isInternalRequest(req)) {
    return next();
  }
  limiter(req, res, next);
});

// Simple in-memory cache placeholder (can be replaced with Redis later).
const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key: string, value: unknown): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + cacheTtlSeconds * 1000,
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: "news-api" });
});

app.get("/news", (req: Request, res: Response) => {
  const topic = String(req.query.topic || "general").toLowerCase();
  const cacheKey = `news:${topic}`;
  const cached = getCached(cacheKey);

  if (cached) {
    return res.status(200).json({ ok: true, source: "cache", data: cached });
  }

  // Placeholder response. Replace with real NewsAPI fetch logic next.
  const payload = {
    topic,
    items: [
      {
        id: "placeholder-1",
        title: `Sample headline for ${topic}`,
        source: "placeholder",
      },
    ],
  };

  setCached(cacheKey, payload);
  return res.status(200).json({ ok: true, source: "fresh", data: payload });
});

app.listen(port, () => {
  console.log(`news-api listening on ${port}`);
});
