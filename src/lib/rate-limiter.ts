/**
 * In-memory rate limiter for API endpoints.
 * Tracks requests by IP + endpoint with configurable limits.
 */

interface RequestRecord {
  timestamps: number[];
}

// Endpoint bazlı store
const stores = new Map<string, Map<string, RequestRecord>>();

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const CLEANUP_INTERVAL_MS = 5 * MINUTE_MS;

interface RateLimitConfig {
  maxPerMinute: number;
  maxPerHour: number;
}

// Endpoint bazlı limitler
const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  "/api/analyze": { maxPerMinute: 5, maxPerHour: 30 },
  "/api/analyze-stream": { maxPerMinute: 5, maxPerHour: 30 },
  "/api/extract-text": { maxPerMinute: 3, maxPerHour: 20 },
  "/api/uyap-search": { maxPerMinute: 10, maxPerHour: 60 },
  "/api/ask": { maxPerMinute: 10, maxPerHour: 100 },
  "/api/improve-text": { maxPerMinute: 5, maxPerHour: 30 },
  "/api/payment/checkout": { maxPerMinute: 3, maxPerHour: 10 },
  default: { maxPerMinute: 10, maxPerHour: 50 },
};

function getStore(endpoint: string): Map<string, RequestRecord> {
  if (!stores.has(endpoint)) {
    stores.set(endpoint, new Map());
  }
  return stores.get(endpoint)!;
}

/**
 * Check whether a request from the given IP is allowed for the endpoint.
 */
export function checkRateLimit(
  ip: string,
  endpoint: string = "default"
): { allowed: boolean; retryAfter?: number } {
  const config = ENDPOINT_LIMITS[endpoint] || ENDPOINT_LIMITS.default;
  const store = getStore(endpoint);
  const now = Date.now();
  const record = store.get(ip);

  if (!record) {
    store.set(ip, { timestamps: [now] });
    return { allowed: true };
  }

  // Prune timestamps older than 1 hour
  record.timestamps = record.timestamps.filter((t) => now - t < HOUR_MS);

  const minuteAgo = now - MINUTE_MS;
  const requestsLastMinute = record.timestamps.filter((t) => t > minuteAgo).length;
  const requestsLastHour = record.timestamps.length;

  // Check per-minute limit
  if (requestsLastMinute >= config.maxPerMinute) {
    const oldestInWindow = record.timestamps.find((t) => t > minuteAgo)!;
    const retryAfter = Math.ceil((oldestInWindow + MINUTE_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check per-hour limit
  if (requestsLastHour >= config.maxPerHour) {
    const oldestInWindow = record.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + HOUR_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

/**
 * Extract client IP from request headers safely.
 * Does NOT trust x-forwarded-for blindly - takes first IP only.
 */
export function getClientIp(headers: Headers): string {
  // In production behind a trusted proxy, x-forwarded-for first IP is the client
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    // Basic IP format validation
    if (firstIp && /^[\d.:a-fA-F]+$/.test(firstIp)) {
      return firstIp;
    }
  }
  return headers.get("x-real-ip") || "unknown";
}

/**
 * Remove stale entries to prevent memory leaks.
 */
function cleanup(): void {
  const now = Date.now();
  stores.forEach((store) => {
    store.forEach((record, ip) => {
      record.timestamps = record.timestamps.filter((t) => now - t < HOUR_MS);
      if (record.timestamps.length === 0) {
        store.delete(ip);
      }
    });
  });
}

const cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL_MS);
if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}
