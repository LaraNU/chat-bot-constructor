import { MS_PER_SECOND } from './constants';

export type RateLimitWindow = {
  max: number;
  windowMs: number;
};

export type RateLimitConfig = {
  mutation: RateLimitWindow;
  webhookIp: RateLimitWindow;
  webhookBot: RateLimitWindow;
};

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];

  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    mutation: {
      max: readPositiveInt('RATE_LIMIT_MUTATION_MAX', 10),
      windowMs: readPositiveInt('RATE_LIMIT_MUTATION_WINDOW_SEC', 60) * MS_PER_SECOND,
    },
    webhookIp: {
      max: readPositiveInt('RATE_LIMIT_WEBHOOK_IP_MAX', 60),
      windowMs: readPositiveInt('RATE_LIMIT_WEBHOOK_IP_WINDOW_SEC', 60) * MS_PER_SECOND,
    },
    webhookBot: {
      max: readPositiveInt('RATE_LIMIT_WEBHOOK_BOT_MAX', 120),
      windowMs: readPositiveInt('RATE_LIMIT_WEBHOOK_BOT_WINDOW_SEC', 60) * MS_PER_SECOND,
    },
  };
}
