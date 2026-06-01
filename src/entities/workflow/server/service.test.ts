import { workflowRepository } from './repository';
import { workflowService } from './service';
import { vi, describe, test, beforeEach, expect } from 'vitest';
import type { Flow } from '@prisma/client';
import type { AppNode, AppEdge } from '../model/types';

vi.mock('./repository', () => ({
  workflowRepository: {
    getByBotId: vi.fn(),
    upsertByBotId: vi.fn(),
  },
}));

describe('workflowService', () => {
  const mockBotId = 'f815bd7c-dc31-4bc0-a860-15624c2443dd';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return workflow data when existing', async () => {
    const mockWorkflow: Flow = {
      id: 'flow-id',
      botId: mockBotId,
      nodes: [
        { id: '1', type: 'start', data: { triggerType: 'manual' }, position: { x: 0, y: 0 } },
      ] as AppNode[],
      edges: [] as AppEdge[],
    };

    vi.mocked(workflowRepository.getByBotId).mockResolvedValue(mockWorkflow);

    const result = await workflowService.getWorkflowByBotId(mockBotId);

    expect(workflowRepository.getByBotId).toHaveBeenCalledWith(mockBotId);
    expect(result).toEqual(mockWorkflow);
  });

  test('should upsert workflow with valid data', async () => {
    const mockWorkflow: Flow = {
      id: 'flow-id',
      botId: mockBotId,
      nodes: [] as AppNode[],
      edges: [] as AppEdge[],
    };

    vi.mocked(workflowRepository.upsertByBotId).mockResolvedValue(mockWorkflow);

    const result = await workflowService.saveWorkflow(mockBotId, [], []);

    expect(workflowRepository.upsertByBotId).toHaveBeenCalledWith(mockBotId, [], []);
    expect(result).toEqual(mockWorkflow);
  });

  test('should validate the workflow payload', async () => {
    await expect(workflowService.saveWorkflow('invalid-bot-id', [], [])).rejects.toThrow(
      'botId must be a valid UUID'
    );

    expect(workflowRepository.upsertByBotId).not.toHaveBeenCalled();
  });
});
