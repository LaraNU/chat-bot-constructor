import { afterEach, describe, expect, test } from 'vitest';
import { getRateLimitConfig } from './config';
import { MS_PER_SECOND } from './constants';

const ENV_KEYS = [
  'RATE_LIMIT_MUTATION_MAX',
  'RATE_LIMIT_MUTATION_WINDOW_SEC',
  'RATE_LIMIT_WEBHOOK_IP_MAX',
  'RATE_LIMIT_WEBHOOK_IP_WINDOW_SEC',
  'RATE_LIMIT_WEBHOOK_BOT_MAX',
  'RATE_LIMIT_WEBHOOK_BOT_WINDOW_SEC',
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe('getRateLimitConfig', () => {
  test('returns documented defaults when env vars are unset', () => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }

    expect(getRateLimitConfig()).toEqual({
      mutation: { max: 10, windowMs: 60 * MS_PER_SECOND },
      webhookIp: { max: 60, windowMs: 60 * MS_PER_SECOND },
      webhookBot: { max: 120, windowMs: 60 * MS_PER_SECOND },
    });
  });

  test('reads positive integers from env', () => {
    process.env.RATE_LIMIT_MUTATION_MAX = '3';
    process.env.RATE_LIMIT_MUTATION_WINDOW_SEC = '15';
    process.env.RATE_LIMIT_WEBHOOK_IP_MAX = '9';
    process.env.RATE_LIMIT_WEBHOOK_IP_WINDOW_SEC = '30';
    process.env.RATE_LIMIT_WEBHOOK_BOT_MAX = '40';
    process.env.RATE_LIMIT_WEBHOOK_BOT_WINDOW_SEC = '20';

    expect(getRateLimitConfig()).toEqual({
      mutation: { max: 3, windowMs: 15 * MS_PER_SECOND },
      webhookIp: { max: 9, windowMs: 30 * MS_PER_SECOND },
      webhookBot: { max: 40, windowMs: 20 * MS_PER_SECOND },
    });
  });

  test('falls back to defaults for invalid values', () => {
    process.env.RATE_LIMIT_MUTATION_MAX = '0';
    process.env.RATE_LIMIT_MUTATION_WINDOW_SEC = '-5';
    process.env.RATE_LIMIT_WEBHOOK_IP_MAX = 'nope';

    const config = getRateLimitConfig();

    expect(config.mutation).toEqual({ max: 10, windowMs: 60 * MS_PER_SECOND });
    expect(config.webhookIp.max).toBe(60);
  });
});
