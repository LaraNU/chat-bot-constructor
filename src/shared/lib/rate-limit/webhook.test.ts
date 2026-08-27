import { afterEach, describe, expect, test } from 'vitest';
import {
  consumeWebhookBotRateLimit,
  consumeWebhookIpRateLimit,
  resetWebhookRateLimiters,
} from './webhook';

const ENV_KEYS = [
  'RATE_LIMIT_WEBHOOK_IP_MAX',
  'RATE_LIMIT_WEBHOOK_IP_WINDOW_SEC',
  'RATE_LIMIT_WEBHOOK_BOT_MAX',
  'RATE_LIMIT_WEBHOOK_BOT_WINDOW_SEC',
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  resetWebhookRateLimiters();

  for (const key of ENV_KEYS) {
    const value = originalEnv[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe('webhook rate limiters', () => {
  test('IP limiter does not consume the bot limiter budget', () => {
    process.env.RATE_LIMIT_WEBHOOK_IP_MAX = '1';
    process.env.RATE_LIMIT_WEBHOOK_BOT_MAX = '1';

    expect(consumeWebhookIpRateLimit('1.1.1.1').allowed).toBe(true);
    expect(consumeWebhookIpRateLimit('1.1.1.1').allowed).toBe(false);
    expect(consumeWebhookBotRateLimit('bot-1').allowed).toBe(true);
  });

  test('bot limiter does not consume the IP limiter budget', () => {
    process.env.RATE_LIMIT_WEBHOOK_IP_MAX = '1';
    process.env.RATE_LIMIT_WEBHOOK_BOT_MAX = '1';

    expect(consumeWebhookBotRateLimit('bot-1').allowed).toBe(true);
    expect(consumeWebhookBotRateLimit('bot-1').allowed).toBe(false);
    expect(consumeWebhookIpRateLimit('1.1.1.1').allowed).toBe(true);
  });
});
