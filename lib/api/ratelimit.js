import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 1 minute
// Note: Redis.fromEnv() automatically uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export async function checkRateLimit(request, _limit = 10, _windowMs = 60000) {
  // Use IP if available, fallback to a global bucket if not
  const ip = request.headers.get('x-forwarded-for') || 'global';
  
  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    return {
      success,
      limit,
      remaining,
      reset
    };
  } catch (error) {
    console.error("Upstash Rate Limit Error:", error);
    // If Redis fails, fail open to avoid blocking legitimate users during an outage
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }
}

