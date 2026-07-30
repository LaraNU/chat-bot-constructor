import { vi, beforeEach, describe, test, expect } from 'vitest';
import EditorPage from './page';
import { requireAuthenticatedUser } from '@/shared/auth';
import { workflowService } from '@/entities/workflow/server/service';
import { botService } from '@/entities/bot/server';
import { notFound } from 'next/navigation';
import { NotFoundError } from '@/shared/api/errors';
import type { User } from '@supabase/supabase-js';
import type { Bot } from '@prisma/client';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('@/app/providers/scoped-intl-provider', () => ({
  ScopedIntlProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/views/workflow-editor', () => ({
  WorkflowEditorPage: () => null,
}));

vi.mock('@/shared/auth', () => ({
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock('@/entities/workflow/server/service', () => ({
  workflowService: {
    getWorkflowByBotId: vi.fn(),
  },
}));

vi.mock('@/entities/bot/server', () => ({
  botService: {
    assertBotOwnership: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('EditorPage', () => {
  const mockUserId = 'temp-user-id';
  const mockBotId = 'bot-uuid-1234';

  const mockBot: Bot = {
    id: mockBotId,
    userId: mockUserId,
    name: 'Owned Bot',
    description: null,
    token: 'secret-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({ id: mockUserId } as User);
  });

  test('should render the editor when the requesting user owns the bot', async () => {
    vi.mocked(botService.assertBotOwnership).mockResolvedValue(mockBot);
    vi.mocked(workflowService.getWorkflowByBotId).mockResolvedValue({
      id: 'flow-id',
      botId: mockBotId,
      updatedAt: new Date(),
      nodes: [],
      edges: [],
    });

    const result = await EditorPage({
      params: Promise.resolve({ locale: 'en', id: mockBotId }),
    });

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(workflowService.getWorkflowByBotId).toHaveBeenCalledWith(mockBotId);
    expect(notFound).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  test('should call notFound and never load the workflow when the bot belongs to another user', async () => {
    vi.mocked(botService.assertBotOwnership).mockRejectedValue(new NotFoundError('Bot not found'));

    await expect(
      EditorPage({ params: Promise.resolve({ locale: 'en', id: mockBotId }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(workflowService.getWorkflowByBotId).not.toHaveBeenCalled();
  });

  test('should call notFound when the id param is missing, without checking ownership', async () => {
    await expect(EditorPage({ params: Promise.resolve({ locale: 'en', id: '' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );

    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(workflowService.getWorkflowByBotId).not.toHaveBeenCalled();
  });

  test('should rethrow unexpected errors from ownership check instead of masking them as 404', async () => {
    vi.mocked(botService.assertBotOwnership).mockRejectedValue(new Error('DB connection lost'));

    await expect(
      EditorPage({ params: Promise.resolve({ locale: 'en', id: mockBotId }) })
    ).rejects.toThrow('DB connection lost');

    expect(notFound).not.toHaveBeenCalled();
    expect(workflowService.getWorkflowByBotId).not.toHaveBeenCalled();
  });
});
