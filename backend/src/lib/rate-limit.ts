import { NextRequest } from "next/server";
import { redis } from "./redis";

const LIMIT = 50;
const WINDOW_MS = 60 * 1000;

export async function checkRateLimit(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    req.nextUrl?.hostname === "localhost" ||
    req.nextUrl?.hostname === "127.0.0.1";

  // Bypass rate limiting in development or when accessing via localhost
  if (process.env.NODE_ENV === "development" || isLocalhost) {
    return { success: true, remaining: 999999, resetTime: 0 };
  }

  const ip = req.headers.get("x-forwarded-for") ?? "global";
  const key = `rate_limit:${ip}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.pexpire(key, WINDOW_MS);
    }

    if (current > LIMIT) {
      const ttl = await redis.pttl(key);
      return { success: false, remaining: 0, resetTime: Date.now() + ttl };
    }

    return { success: true, remaining: LIMIT - current };
  } catch (err) {
    // Fail open if Redis is temporarily unreachable
    return { success: true, remaining: LIMIT };
  }
}
