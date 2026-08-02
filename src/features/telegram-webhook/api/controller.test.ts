import { vi, beforeEach, describe, test, expect } from 'vitest';
import { NextRequest } from 'next/server';

import { handleTelegramWebhook } from './controller';
import { botService } from '@/entities/bot/server';
import { flowSnapshotRepository } from '@/entities/workflow/server/snapshot-repository';
import { getUserSessionState, saveUserSession } from '../lib/session';
import { runWorkflowEngine } from '../lib/engine';
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
}));

vi.mock('../lib/engine', () => ({
  runWorkflowEngine: vi.fn(),
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
  };

  function buildRequest({
    botId = mockBotId,
    secret,
    body = { message: { chat: { id: 1 }, from: {}, text: 'hi' } },
  }: {
    botId?: string | null;
    secret?: string | null;
    body?: unknown;
  } = {}) {
    const url = botId
      ? `https://app.example.com/api/webhook?botId=${botId}`
      : 'https://app.example.com/api/webhook';

    const headers = new Headers();

    if (secret) {
      headers.set('x-telegram-bot-api-secret-token', secret);
    }

    return new NextRequest(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserSessionState).mockResolvedValue({
      currentNodeId: null,
      tempData: { answers: {}, responses: [] },
      userText: 'hi',
    });
    vi.mocked(runWorkflowEngine).mockResolvedValue(null);
    vi.mocked(saveUserSession).mockResolvedValue(undefined);
    vi.mocked(flowSnapshotRepository.findByBotId).mockResolvedValue(mockSnapshot);
    vi.mocked(botService.getBotById).mockResolvedValue(mockBot);
  });

  test('should reject the request when botId is missing, without touching the secret or the DB', async () => {
    const response = await handleTelegramWebhook(buildRequest({ botId: null }));

    expect(response.status).toBe(400);
    expect(botService.verifyWebhookSecret).not.toHaveBeenCalled();
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
});
