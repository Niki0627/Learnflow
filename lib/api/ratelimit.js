// Basic in-memory rate limiter for Next.js API routes.
// Note: In serverless environments, this state is per-container.
const rateLimits = new Map();

// Cleans up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimits.entries()) {
    if (now > data.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function checkRateLimit(request, limit = 10, windowMs = 60000) {
  // Use IP if available, fallback to a global bucket if not (not ideal, but better than nothing)
  const ip = request.headers.get('x-forwarded-for') || 'global';
  const now = Date.now();
  
  let record = rateLimits.get(ip);
  
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
  }
  
  record.count += 1;
  rateLimits.set(ip, record);
  
  return {
    success: record.count <= limit,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: record.resetTime
  };
}
