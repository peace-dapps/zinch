// In-memory rate limiter. Resets on server restart.
// For production scale, swap to Upstash Redis or similar.

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

// Clean up old entries every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetAt: number } {
  const { key, limit, windowMs } = options;
  const now = Date.now();

  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}