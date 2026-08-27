import { vi, beforeEach, describe, test, expect } from 'vitest';
import { NextRequest } from 'next/server';

import { handleTelegramWebhook } from './controller';
import { botService } from '@/entities/bot/server';
import { flowSnapshotRepository } from '@/entities/workflow/server/snapshot-repository';
import { getUserSessionState, saveUserSession, isUpdateAlreadyProcessed } from '../lib/session';
import { runWorkflowEngine } from '../lib/engine';
import { consumeWebhookBotRateLimit, consumeWebhookIpRateLimit } from '@/shared/lib/rate-limit';
import type { Bot } from '@prisma/client';
import type { FlowSnapshot } from '@prisma/client';

vi.mock('@/entities/bot/server', () => ({
  botService: {
    getBotById: vi.fn(),
    verifyWebhookSecret: vi.fn(),
  },
}));

vi.mock('@/entities/workflow/server/snapshot-repository', () => ({
  flowSnapshotRepository: {
    findByBotId: vi.fn(),
  },
}));

vi.mock('../lib/session', () => ({
  getUserSessionState: vi.fn(),
  saveUserSession: vi.fn(),
  isUpdateAlreadyProcessed: vi.fn(),
}));

vi.mock('../lib/engine', () => ({
  runWorkflowEngine: vi.fn(),
}));

vi.mock('@/shared/lib/rate-limit', () => ({
  consumeWebhookIpRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, retryAfterSec: 0 })),
  consumeWebhookBotRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, retryAfterSec: 0 })),
}));

describe('handleTelegramWebhook', () => {
  const mockBotId = 'bot-uuid-1234';
  const mockToken = '123456:abcDEF-token';
  const mockSecret = 'a'.repeat(64);

  const mockBot: Bot = {
    id: mockBotId,
    name: 'Owned Bot',
    description: null,
    userId: 'user-1',
    token: mockToken,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSnapshot: FlowSnapshot = {
    id: 'snapshot-1',
    flowId: 'flow-1',
    nodes: [],
    edges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function buildRequest({
    botId = mockBotId,
    secret,
    ip,
    body = { update_id: 100, message: { chat: { id: 1 }, from: {}, text: 'hi' } },
  }: {
    botId?: string | null;
    secret?: string | null;
    ip?: string;
    body?: unknown;
  } = {}) {
    const url = botId
      ? `https://app.example.com/api/webhook?botId=${botId}`
      : 'https://app.example.com/api/webhook';

    const headers = new Headers();

    if (secret) {
      headers.set('x-telegram-bot-api-secret-token', secret);
    }

    if (ip) {
      headers.set('x-forwarded-for', ip);
    }

    return new NextRequest(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(consumeWebhookIpRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      retryAfterSec: 0,
    });
    vi.mocked(consumeWebhookBotRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      retryAfterSec: 0,
    });
    vi.mocked(getUserSessionState).mockResolvedValue({
      currentNodeId: null,
      tempData: { answers: {}, responses: [] },
      userText: 'hi',
    });
    vi.mocked(runWorkflowEngine).mockResolvedValue(null);
    vi.mocked(saveUserSession).mockResolvedValue(undefined);
    vi.mocked(isUpdateAlreadyProcessed).mockResolvedValue(false);
    vi.mocked(flowSnapshotRepository.findByBotId).mockResolvedValue(mockSnapshot);
    vi.mocked(botService.getBotById).mockResolvedValue(mockBot);
  });

  test('should reject the request when botId is missing, without touching the secret or the DB', async () => {
    const response = await handleTelegramWebhook(buildRequest({ botId: null }));

    expect(response.status).toBe(400);
    expect(botService.verifyWebhookSecret).not.toHaveBeenCalled();
    expect(consumeWebhookIpRateLimit).not.toHaveBeenCalled();
    expect(consumeWebhookBotRateLimit).not.toHaveBeenCalled();
    expect(botService.getBotById).not.toHaveBeenCalled();
  });

  test('should reject the request with 401 when the secret header is missing', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(false);

    const response = await handleTelegramWebhook(buildRequest({ secret: null }));

    expect(response.status).toBe(401);
    expect(botService.verifyWebhookSecret).toHaveBeenCalledWith(mockBotId, null);
    // Secret is rejected before any DB access — no bot lookup, no session/engine work.
    expect(botService.getBotById).not.toHaveBeenCalled();
    expect(flowSnapshotRepository.findByBotId).not.toHaveBeenCalled();
    expect(runWorkflowEngine).not.toHaveBeenCalled();
  });

  test('should reject the request with 401 when the secret header is wrong', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(false);

    const response = await handleTelegramWebhook(buildRequest({ secret: 'wrong-secret' }));

    expect(response.status).toBe(401);
    expect(botService.getBotById).not.toHaveBeenCalled();
  });

  test('should return 500 and never run the engine when the bot has no token configured', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
    vi.mocked(botService.getBotById).mockResolvedValue({ ...mockBot, token: null });

    const response = await handleTelegramWebhook(buildRequest({ secret: mockSecret }));

    expect(response.status).toBe(500);
    expect(runWorkflowEngine).not.toHaveBeenCalled();
  });

  test('should read the bot token from the database, not from the request, and run the engine', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);

    const response = await handleTelegramWebhook(buildRequest({ secret: mockSecret }));

    expect(botService.verifyWebhookSecret).toHaveBeenCalledWith(mockBotId, mockSecret);
    expect(botService.getBotById).toHaveBeenCalledWith(mockBotId);
    expect(runWorkflowEngine).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ botId: mockBotId, botToken: mockToken }),
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  test('should swallow unexpected errors and still return 200 to Telegram', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
    vi.mocked(flowSnapshotRepository.findByBotId).mockRejectedValue(new Error('DB is down'));

    const response = await handleTelegramWebhook(buildRequest({ secret: mockSecret }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  test('should return 500 and never run the engine when no snapshot has been published', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
    vi.mocked(flowSnapshotRepository.findByBotId).mockResolvedValue(null);

    const response = await handleTelegramWebhook(buildRequest({ secret: mockSecret }));

    expect(response.status).toBe(500);
    expect(runWorkflowEngine).not.toHaveBeenCalled();
  });

  test('should ignore updates without a message or callback query', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);

    const response = await handleTelegramWebhook(
      buildRequest({ secret: mockSecret, body: { update_id: 1 } })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(runWorkflowEngine).not.toHaveBeenCalled();
  });

  test('should ignore updates without a resolvable chat id', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);

    const response = await handleTelegramWebhook(
      buildRequest({ secret: mockSecret, body: { message: { from: {}, text: 'hi' } } })
    );

    expect(response.status).toBe(200);
    expect(runWorkflowEngine).not.toHaveBeenCalled();
  });

  test('should build the engine context from a callback_query update', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);

    const response = await handleTelegramWebhook(
      buildRequest({
        secret: mockSecret,
        body: {
          callback_query: {
            from: { username: 'callback-user' },
            message: { chat: { id: 42 } },
            data: 'btn-1',
          },
        },
      })
    );

    expect(runWorkflowEngine).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          botId: mockBotId,
          chatId: '42',
          callbackData: 'btn-1',
          username: 'callback-user',
        }),
      })
    );
    expect(response.status).toBe(200);
  });

  test('should persist the session with the node id and update_id returned by the engine', async () => {
    vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
    vi.mocked(runWorkflowEngine).mockResolvedValue('next-node-id');

    await handleTelegramWebhook(
      buildRequest({
        secret: mockSecret,
        body: { update_id: 100, message: { chat: { id: 1 }, from: {}, text: 'hi' } },
      })
    );

    expect(saveUserSession).toHaveBeenCalledWith(
      mockBotId,
      '1',
      'next-node-id',
      expect.objectContaining({ answers: {}, responses: [] }),
      100
    );
  });

  describe('update_id idempotency (#61)', () => {
    test('should skip processing and return success when the update_id was already processed for this chat', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
      vi.mocked(isUpdateAlreadyProcessed).mockResolvedValue(true);

      const response = await handleTelegramWebhook(
        buildRequest({
          secret: mockSecret,
          body: { update_id: 100, message: { chat: { id: 1 }, from: {}, text: 'hi' } },
        })
      );

      expect(isUpdateAlreadyProcessed).toHaveBeenCalledWith(mockBotId, '1', 100);
      expect(runWorkflowEngine).not.toHaveBeenCalled();
      expect(saveUserSession).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ success: true });
    });

    test('should process a new (not previously seen) update_id as usual', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
      vi.mocked(isUpdateAlreadyProcessed).mockResolvedValue(false);

      const response = await handleTelegramWebhook(
        buildRequest({
          secret: mockSecret,
          body: { update_id: 101, message: { chat: { id: 1 }, from: {}, text: 'hi' } },
        })
      );

      expect(isUpdateAlreadyProcessed).toHaveBeenCalledWith(mockBotId, '1', 101);
      expect(runWorkflowEngine).toHaveBeenCalled();
      expect(saveUserSession).toHaveBeenCalledWith(
        mockBotId,
        '1',
        null,
        expect.objectContaining({ answers: {}, responses: [] }),
        101
      );
      expect(response.status).toBe(200);
    });

    test('should not check idempotency for updates without a message or callback query', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);

      await handleTelegramWebhook(buildRequest({ secret: mockSecret, body: { update_id: 1 } }));

      expect(isUpdateAlreadyProcessed).not.toHaveBeenCalled();
    });
  });

  describe('rate limiting (#62)', () => {
    test('should consume the IP limiter (not the bot limiter) and still return 401 for an invalid secret', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(false);

      const response = await handleTelegramWebhook(
        buildRequest({
          secret: 'wrong-secret',
          ip: '203.0.113.10',
        })
      );

      expect(response.status).toBe(401);
      expect(consumeWebhookIpRateLimit).toHaveBeenCalledWith('203.0.113.10');
      expect(consumeWebhookBotRateLimit).not.toHaveBeenCalled();
      expect(botService.getBotById).not.toHaveBeenCalled();
    });

    test('should still return 401 when the IP limiter is exceeded, without touching the bot', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(false);
      vi.mocked(consumeWebhookIpRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        retryAfterSec: 30,
      });

      const response = await handleTelegramWebhook(buildRequest({ secret: 'wrong-secret' }));

      expect(response.status).toBe(401);
      expect(consumeWebhookBotRateLimit).not.toHaveBeenCalled();
      expect(runWorkflowEngine).not.toHaveBeenCalled();
    });

    test('should consume the bot limiter (not the IP limiter) for a valid secret', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);

      const response = await handleTelegramWebhook(buildRequest({ secret: mockSecret }));

      expect(response.status).toBe(200);
      expect(consumeWebhookBotRateLimit).toHaveBeenCalledWith(mockBotId);
      expect(consumeWebhookIpRateLimit).not.toHaveBeenCalled();
      expect(runWorkflowEngine).toHaveBeenCalled();
    });

    test('should drop valid traffic with 200 when the bot limiter is exceeded, without running the engine', async () => {
      vi.mocked(botService.verifyWebhookSecret).mockReturnValue(true);
      vi.mocked(consumeWebhookBotRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        retryAfterSec: 20,
      });

      const response = await handleTelegramWebhook(buildRequest({ secret: mockSecret }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ success: true });
      expect(consumeWebhookIpRateLimit).not.toHaveBeenCalled();
      expect(botService.getBotById).not.toHaveBeenCalled();
      expect(runWorkflowEngine).not.toHaveBeenCalled();
    });
  });
});
