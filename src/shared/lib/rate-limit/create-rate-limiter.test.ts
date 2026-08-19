import { describe, expect, test } from 'vitest';
import { createRateLimiter } from './create-rate-limiter';
import { MS_PER_SECOND } from './constants';

describe('createRateLimiter', () => {
  test('allows requests under the max within the window', () => {
    const now = MS_PER_SECOND;
    const limiter = createRateLimiter({ max: 2, windowMs: MS_PER_SECOND, now: () => now });

    expect(limiter.consume('user-1')).toEqual({
      allowed: true,
      remaining: 1,
      retryAfterSec: 0,
    });
    expect(limiter.consume('user-1')).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterSec: 0,
    });
  });

  test('rejects the next request once the max is reached', () => {
    const now = MS_PER_SECOND;
    const limiter = createRateLimiter({ max: 2, windowMs: MS_PER_SECOND, now: () => now });

    limiter.consume('user-1');
    limiter.consume('user-1');

    expect(limiter.consume('user-1')).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSec: 1,
    });
  });

  test('tracks keys independently', () => {
    const limiter = createRateLimiter({
      max: 1,
      windowMs: MS_PER_SECOND,
      now: () => MS_PER_SECOND,
    });

    expect(limiter.consume('user-1').allowed).toBe(true);
    expect(limiter.consume('user-2').allowed).toBe(true);
    expect(limiter.consume('user-1').allowed).toBe(false);
  });

  test('allows traffic again after the window elapses', () => {
    let now = MS_PER_SECOND;
    const limiter = createRateLimiter({ max: 1, windowMs: MS_PER_SECOND, now: () => now });

    expect(limiter.consume('user-1').allowed).toBe(true);
    expect(limiter.consume('user-1').allowed).toBe(false);

    now = 2 * MS_PER_SECOND + 1;

    expect(limiter.consume('user-1')).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterSec: 0,
    });
  });

  test('computes retryAfterSec from the oldest hit in the window', () => {
    let now = 0;
    const limiter = createRateLimiter({ max: 1, windowMs: 5 * MS_PER_SECOND, now: () => now });

    limiter.consume('user-1');
    now = 2 * MS_PER_SECOND;

    expect(limiter.consume('user-1')).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSec: 3,
    });
  });
});
