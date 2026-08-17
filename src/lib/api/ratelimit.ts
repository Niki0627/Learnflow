import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimitInstance: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimitInstance) return ratelimitInstance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const redis = new Redis({ url, token });
    ratelimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
    });
    return ratelimitInstance;
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis ratelimit:", err);
    return null;
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit keyed by the authenticated user id when available,
 * falling back to the request IP.
 */
export async function checkRateLimit(
  request: Request,
  userId?: string | null,
): Promise<RateLimitResult> {
  const limiter = getRatelimit();
  if (!limiter) {
    // If Redis is not configured (e.g. local dev / CI), allow request
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "global";
  const key = userId || ip;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(key);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error("Upstash Rate Limit Error:", error);
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }
}
