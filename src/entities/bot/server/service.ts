import { createHmac, timingSafeEqual } from 'crypto';

import { botRepository, type BotWithPublishInfo } from './repository';
import { createBotSchema } from '../model/types';
import { NotFoundError } from '@/shared/api/errors';
import type { Bot } from '@prisma/client';

export const botService = {
  async getAllBots(userId: string) {
    return await botRepository.findAllByUserId(userId);
  },

  /**
   * Single source of truth for verifying that `botId` belongs to `userId`.
   * Throws the same `NotFoundError` whether the bot does not exist or belongs
   * to a different user, so callers cannot use the response to enumerate
   * other users' bot ids.
   */
  async assertBotOwnership(userId: string, botId: string): Promise<Bot> {
    const bot = await botRepository.findById(botId);

    if (!bot || bot.userId !== userId) {
      throw new NotFoundError('Bot not found');
    }

    return bot;
  },

  /**
   * Looks up a bot by id without any ownership check.
   * Only safe for system/machine contexts that have already authenticated
   * through another mechanism (e.g. an incoming Telegram webhook request that
   * already passed `verifyWebhookSecret`) and are not acting on behalf of a
   * specific dashboard user. Any user-facing code path must use
   * `assertBotOwnership` instead.
   */
  async getBotById(id: string): Promise<Bot | null> {
    return await botRepository.findById(id);
  },

  /**
   * Deterministically derives the per-bot Telegram webhook secret from `botId`
   * and a server-only key, instead of storing a secret per bot in the database.
   * This avoids a schema migration and a backfill for existing bots, while still
   * giving every bot its own unique secret (compromising one bot's secret does
   * not expose any other bot's secret, since `botId` is part of the HMAC input).
   */
  getWebhookSecret(botId: string): string {
    const secretKey = process.env.TELEGRAM_WEBHOOK_SECRET_KEY;

    if (!secretKey) {
      throw new Error('TELEGRAM_WEBHOOK_SECRET_KEY environment variable is not set');
    }

    return createHmac('sha256', secretKey).update(botId).digest('hex');
  },

  /**
   * Verifies the `X-Telegram-Bot-Api-Secret-Token` header against the expected
   * per-bot secret using a constant-time comparison, so response timing cannot
   * be used to guess a valid secret one byte at a time.
   */
  verifyWebhookSecret(botId: string, providedSecret: string | null): boolean {
    if (!providedSecret) {
      return false;
    }

    const expected = Buffer.from(botService.getWebhookSecret(botId), 'utf8');
    const provided = Buffer.from(providedSecret, 'utf8');

    if (expected.length !== provided.length) {
      return false;
    }

    return timingSafeEqual(expected, provided);
  },

  async getPaginatedBots(
    userId: string,
    limit: number,
    offset: number
  ): Promise<BotWithPublishInfo[]> {
    return await botRepository.findPaginatedByUserId(userId, limit, offset);
  },

  async createNewBot(data: { name: string; description?: string; userId: string }) {
    const parsed = createBotSchema.safeParse({ name: data.name, description: data.description });

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((item) => item.message).join(', '));
    }

    return await botRepository.create(data);
  },

  async deleteBot(id: string): Promise<Bot> {
    if (!id) {
      throw new Error('Bot ID is required');
    }
    return await botRepository.delete(id);
  },
};
