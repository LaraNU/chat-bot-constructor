import { vi, beforeEach, describe, test, expect } from 'vitest';

import { getUserSessionState, saveUserSession, isUpdateAlreadyProcessed } from './session';
import { prisma } from '@/shared/lib/prisma';
import type { TempData } from './nodes/types';

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    userSession: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('session', () => {
  const botId = 'bot-1';
  const chatId = '42';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isUpdateAlreadyProcessed', () => {
    test('returns false when there is no session yet for this chat', async () => {
      vi.mocked(prisma.userSession.findUnique).mockResolvedValue(null);

      const result = await isUpdateAlreadyProcessed(botId, chatId, 100);

      expect(prisma.userSession.findUnique).toHaveBeenCalledWith({
        where: { botId_telegramChatId: { botId, telegramChatId: chatId } },
        select: { lastUpdateId: true },
      });
      expect(result).toBe(false);
    });

    test('returns false when the stored lastUpdateId differs from the given update_id', async () => {
      vi.mocked(prisma.userSession.findUnique).mockResolvedValue({ lastUpdateId: 99 } as never);

      const result = await isUpdateAlreadyProcessed(botId, chatId, 100);

      expect(result).toBe(false);
    });

    test('returns true when the stored lastUpdateId matches the given update_id (retry)', async () => {
      vi.mocked(prisma.userSession.findUnique).mockResolvedValue({ lastUpdateId: 100 } as never);

      const result = await isUpdateAlreadyProcessed(botId, chatId, 100);

      expect(result).toBe(true);
    });

    test('returns false when the stored lastUpdateId is null (never processed anything yet)', async () => {
      vi.mocked(prisma.userSession.findUnique).mockResolvedValue({ lastUpdateId: null } as never);

      const result = await isUpdateAlreadyProcessed(botId, chatId, 100);

      expect(result).toBe(false);
    });
  });

  describe('saveUserSession', () => {
    const tempData: TempData = { answers: {}, responses: [] };

    test('writes lastUpdateId together with the rest of the session state in a single upsert', async () => {
      vi.mocked(prisma.userSession.upsert).mockResolvedValue({} as never);

      await saveUserSession(botId, chatId, 'node-1', tempData, 100);

      expect(prisma.userSession.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { botId_telegramChatId: { botId, telegramChatId: chatId } },
          create: expect.objectContaining({ currentNodeId: 'node-1', lastUpdateId: 100 }),
          update: expect.objectContaining({ currentNodeId: 'node-1', lastUpdateId: 100 }),
        })
      );
    });

    test('does not touch lastUpdateId when no update_id is provided', async () => {
      vi.mocked(prisma.userSession.upsert).mockResolvedValue({} as never);

      await saveUserSession(botId, chatId, 'node-1', tempData);

      const call = vi.mocked(prisma.userSession.upsert).mock.calls[0][0];

      expect(call.create).toEqual(expect.objectContaining({ lastUpdateId: null }));
      expect(call.update).not.toHaveProperty('lastUpdateId');
    });
  });

  describe('getUserSessionState', () => {
    test('resets the dialog for /start without reading from the database', async () => {
      const result = await getUserSessionState(botId, chatId, '/start');

      expect(prisma.userSession.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual({
        currentNodeId: null,
        tempData: { answers: {}, responses: [] },
        userText: '/start',
      });
    });

    test('reads the current node id and tempData from the stored session', async () => {
      vi.mocked(prisma.userSession.findUnique).mockResolvedValue({
        currentNodeId: 'node-2',
        tempData: { answers: {}, responses: [] },
      } as never);

      const result = await getUserSessionState(botId, chatId, 'hello');

      expect(result.currentNodeId).toBe('node-2');
      expect(result.userText).toBe('hello');
    });
  });
});
