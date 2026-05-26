'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { workflowService } from '../server/service';
import type { AppEdge, AppNode } from '../model/types';
import { UnauthorizedError, ValidationError } from '@/shared/api/errors';
import { revalidatePath } from 'next/cache';

type Props = {
  nodes: AppNode[];
  edges: AppEdge[];
  botId: string;
};

export async function saveWorkflowAction(workflowData: Props) {
  const { botId, nodes, edges } = workflowData;

  if (!botId) {
    throw new ValidationError('botId is required');
  }

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    throw new ValidationError('Invalid payload: nodes/edges must be arrays');
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    const newWorkflow = await workflowService.saveWorkflow(botId, nodes, edges);

    revalidatePath(`/[locale]/editor/${botId}`, 'page');

    return { success: true, data: newWorkflow };
  } catch (error) {
    console.error('❌ Error Server Action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save workflow',
    };
  }
}
