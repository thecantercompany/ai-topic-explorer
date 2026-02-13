const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

const ipRequestMap = new Map<string, number[]>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestMap.entries()) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      ipRequestMap.delete(ip);
    } else {
      ipRequestMap.set(ip, valid);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const timestamps = ipRequestMap.get(ip) || [];

  // Filter to only timestamps within the window
  const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = validTimestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  // Record this request
  validTimestamps.push(now);
  ipRequestMap.set(ip, validTimestamps);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - validTimestamps.length,
  };
}
