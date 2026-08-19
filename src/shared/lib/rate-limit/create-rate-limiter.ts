import { MS_PER_SECOND } from './constants';

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

export type RateLimiter = {
  consume: (key: string) => RateLimitDecision;
};

type CreateRateLimiterOptions = {
  max: number;
  windowMs: number;
  now?: () => number;
};

/**
 * In-memory sliding-window limiter.
 *
 * Best-effort only: the store lives in the current process/isolate. On Vercel
 * (multiple isolates, cold starts) counters are not global — a hard distributed
 * cap needs Redis/Upstash later, once the Telegram runtime is its own service.
 */
export function createRateLimiter({
  max,
  windowMs,
  now = Date.now,
}: CreateRateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    consume(key: string): RateLimitDecision {
      const timestamp = now();
      const cutoff = timestamp - windowMs;
      const recent = (hits.get(key) ?? []).filter((hit) => hit > cutoff);

      if (recent.length >= max) {
        hits.set(key, recent);
        const retryAfterMs = recent[0] + windowMs - timestamp;

        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / MS_PER_SECOND)),
        };
      }

      recent.push(timestamp);
      hits.set(key, recent);

      return {
        allowed: true,
        remaining: max - recent.length,
        retryAfterSec: 0,
      };
    },
  };
}
