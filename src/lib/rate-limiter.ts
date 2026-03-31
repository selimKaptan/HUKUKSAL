/**
 * In-memory rate limiter for the /api/analyze endpoint.
 * Tracks requests by IP address with per-minute and per-hour limits
 * to control Claude AI API usage costs.
 */

interface RequestRecord {
  timestamps: number[];
}

const store = new Map<string, RequestRecord>();

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const CLEANUP_INTERVAL_MS = 5 * MINUTE_MS;

const MAX_PER_MINUTE = 10;
const MAX_PER_HOUR = 50;

/**
 * Check whether a request from the given IP address is allowed.
 *
 * @returns `allowed: true` if the request can proceed, or
 *          `allowed: false` with `retryAfter` (seconds) indicating
 *          how long the caller should wait.
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = store.get(ip);

  if (!record) {
    store.set(ip, { timestamps: [now] });
    return { allowed: true };
  }

  // Prune timestamps older than 1 hour (no longer relevant)
  record.timestamps = record.timestamps.filter((t) => now - t < HOUR_MS);

  const minuteAgo = now - MINUTE_MS;
  const requestsLastMinute = record.timestamps.filter(
    (t) => t > minuteAgo
  ).length;
  const requestsLastHour = record.timestamps.length;

  // Check per-minute limit
  if (requestsLastMinute >= MAX_PER_MINUTE) {
    const oldestInWindow = record.timestamps.find((t) => t > minuteAgo)!;
    const retryAfter = Math.ceil((oldestInWindow + MINUTE_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check per-hour limit
  if (requestsLastHour >= MAX_PER_HOUR) {
    const oldestInWindow = record.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + HOUR_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

/**
 * Remove entries that have no timestamps within the last hour.
 * Runs automatically every 5 minutes to prevent memory leaks
 * from IPs that are no longer active.
 */
function cleanup(): void {
  const now = Date.now();
  for (const [ip, record] of store) {
    record.timestamps = record.timestamps.filter((t) => now - t < HOUR_MS);
    if (record.timestamps.length === 0) {
      store.delete(ip);
    }
  }
}

// Start periodic cleanup (unref so it doesn't keep the process alive)
const cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL_MS);
if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}
