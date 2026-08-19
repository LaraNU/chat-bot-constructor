import { TooManyRequestsError } from '@/shared/api/errors';
import { createRateLimiter, type RateLimiter } from './create-rate-limiter';
import { getRateLimitConfig } from './config';

let mutationLimiter: RateLimiter | undefined;

function getMutationLimiter(): RateLimiter {
  if (!mutationLimiter) {
    mutationLimiter = createRateLimiter(getRateLimitConfig().mutation);
  }

  return mutationLimiter;
}

export function resetMutationRateLimiter(): void {
  mutationLimiter = undefined;
}

export function assertMutationRateLimit(userId: string): void {
  const decision = getMutationLimiter().consume(userId);

  if (!decision.allowed) {
    throw new TooManyRequestsError('Too many requests', decision.retryAfterSec);
  }
}
