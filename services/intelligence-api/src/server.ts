import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";

const app = express();
const port = Number(process.env.PORT || 4001);

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
  // Skip rate limiting for localhost and Docker internal IPs (172.16.0.0/12, 10.0.0.0/8)
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
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path === "/health" || isInternalRequest(req), // Skip health checks + internal calls
  keyGenerator: (req) => {
    // Use X-Forwarded-For from Nginx proxy, fallback to remote IP
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

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: "intelligence-api" });
});

app.listen(port, () => {
  console.log(`intelligence-api listening on ${port}`);
});
