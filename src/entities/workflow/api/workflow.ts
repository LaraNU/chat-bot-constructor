import { apiFetch } from '@/shared/api/base';
import { WorkflowPayload, WorkflowData } from '../model/types';

export const getWorkflowByBotId = async (botId: string): Promise<WorkflowData> => {
  return await apiFetch(`/bots/workflow?botId=${encodeURIComponent(botId)}`);
};

export const saveWorkflow = async (payload: WorkflowPayload): Promise<WorkflowData> => {
  return await apiFetch('/bots/workflow', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
