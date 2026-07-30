import { vi, beforeEach, describe, test, expect } from 'vitest';
import { saveWorkflowAction } from './actions';
import { workflowService } from '../server/service';
import { botService } from '@/entities/bot/server';
import { createClient } from '@/shared/lib/supabase/server';
import { NotFoundError } from '@/shared/api/errors';
import type { AppNode, AppEdge } from '../model/types';
import type { Flow } from '@prisma/client';

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('../server/service', () => ({
  workflowService: {
    saveWorkflow: vi.fn(),
  },
}));

vi.mock('@/entities/bot/server', () => ({
  botService: {
    assertBotOwnership: vi.fn(),
  },
}));

describe('saveWorkflowAction', () => {
  const mockUserId = 'temp-user-id';
  const mockBotId = 'bot-uuid-1234';
  const mockNodes: AppNode[] = [];
  const mockEdges: AppEdge[] = [];

  function mockAuthenticatedUser(userId: string | null) {
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: userId ? { id: userId } : null },
          error: null,
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>;

    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should throw a ValidationError and skip auth/ownership when botId is missing', async () => {
    await expect(
      saveWorkflowAction({ botId: '', nodes: mockNodes, edges: mockEdges })
    ).rejects.toThrow('botId is required');

    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(workflowService.saveWorkflow).not.toHaveBeenCalled();
  });

  test('should return Unauthorized and not touch the workflow when there is no user', async () => {
    mockAuthenticatedUser(null);

    const result = await saveWorkflowAction({
      botId: mockBotId,
      nodes: mockNodes,
      edges: mockEdges,
    });

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(workflowService.saveWorkflow).not.toHaveBeenCalled();
  });

  test('should save the workflow when the requesting user owns the bot', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(botService.assertBotOwnership).mockResolvedValue({
      id: mockBotId,
      userId: mockUserId,
      name: 'Owned Bot',
      description: null,
      token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockWorkflow: Flow = {
      id: 'flow-id',
      botId: mockBotId,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      nodes: mockNodes,
      edges: mockEdges,
    };

    vi.mocked(workflowService.saveWorkflow).mockResolvedValue(mockWorkflow);

    const result = await saveWorkflowAction({
      botId: mockBotId,
      nodes: mockNodes,
      edges: mockEdges,
    });

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(workflowService.saveWorkflow).toHaveBeenCalledWith(mockBotId, mockNodes, mockEdges);
    expect(result).toEqual({ success: true, data: mockWorkflow });
  });

  test('should fail without saving when the bot belongs to another user', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(botService.assertBotOwnership).mockRejectedValue(new NotFoundError('Bot not found'));

    const result = await saveWorkflowAction({
      botId: mockBotId,
      nodes: mockNodes,
      edges: mockEdges,
    });

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(workflowService.saveWorkflow).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Bot not found' });
  });
});
