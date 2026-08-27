import { afterEach, describe, expect, test } from 'vitest';
import { TooManyRequestsError } from '@/shared/api/errors';
import { assertMutationRateLimit, resetMutationRateLimiter } from './mutation';

const ENV_KEYS = ['RATE_LIMIT_MUTATION_MAX', 'RATE_LIMIT_MUTATION_WINDOW_SEC'] as const;
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  resetMutationRateLimiter();

  for (const key of ENV_KEYS) {
    const value = originalEnv[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe('assertMutationRateLimit', () => {
  test('allows requests under the configured max', () => {
    process.env.RATE_LIMIT_MUTATION_MAX = '2';
    process.env.RATE_LIMIT_MUTATION_WINDOW_SEC = '60';

    expect(() => assertMutationRateLimit('user-1')).not.toThrow();
    expect(() => assertMutationRateLimit('user-1')).not.toThrow();
  });

  test('throws TooManyRequestsError once the max is exceeded', () => {
    process.env.RATE_LIMIT_MUTATION_MAX = '1';
    process.env.RATE_LIMIT_MUTATION_WINDOW_SEC = '60';

    assertMutationRateLimit('user-1');

    expect(() => assertMutationRateLimit('user-1')).toThrow(TooManyRequestsError);
  });

  test('tracks users independently', () => {
    process.env.RATE_LIMIT_MUTATION_MAX = '1';
    process.env.RATE_LIMIT_MUTATION_WINDOW_SEC = '60';

    assertMutationRateLimit('user-1');

    expect(() => assertMutationRateLimit('user-2')).not.toThrow();
  });
});
