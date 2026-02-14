const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const ipRequestMap = new Map<string, number[]>();
let lastCleanup = Date.now();

// Lazy cleanup: runs during checkRateLimit calls instead of a leaked setInterval
function cleanupIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [ip, timestamps] of ipRequestMap.entries()) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      ipRequestMap.delete(ip);
    } else {
      ipRequestMap.set(ip, valid);
    }
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
} {
  cleanupIfNeeded();

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
