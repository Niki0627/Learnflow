import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "global";
  const key = userId || ip;

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(key);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error("Upstash Rate Limit Error:", error);
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }
}
