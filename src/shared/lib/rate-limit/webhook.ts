import { createRateLimiter, type RateLimiter, type RateLimitDecision } from './create-rate-limiter';
import { getRateLimitConfig } from './config';

let webhookIpLimiter: RateLimiter | undefined;
let webhookBotLimiter: RateLimiter | undefined;

function getWebhookIpLimiter(): RateLimiter {
  if (!webhookIpLimiter) {
    webhookIpLimiter = createRateLimiter(getRateLimitConfig().webhookIp);
  }

  return webhookIpLimiter;
}

function getWebhookBotLimiter(): RateLimiter {
  if (!webhookBotLimiter) {
    webhookBotLimiter = createRateLimiter(getRateLimitConfig().webhookBot);
  }

  return webhookBotLimiter;
}

export function resetWebhookRateLimiters(): void {
  webhookIpLimiter = undefined;
  webhookBotLimiter = undefined;
}

export function consumeWebhookIpRateLimit(ip: string): RateLimitDecision {
  return getWebhookIpLimiter().consume(ip);
}

export function consumeWebhookBotRateLimit(botId: string): RateLimitDecision {
  return getWebhookBotLimiter().consume(botId);
}
