'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { workflowService } from '../server/service';
import type { AppEdge, AppNode } from '../model/types';
import { UnauthorizedError, ValidationError } from '@/shared/api/errors';
import { botService } from '@/entities/bot/server';
import { revalidatePath } from 'next/cache';

type SaveWorkflowProps = {
  nodes: AppNode[];
  edges: AppEdge[];
  botId: string;
};

export async function saveWorkflowAction(workflowData: SaveWorkflowProps) {
  const { botId, nodes, edges } = workflowData;

  if (!botId) {
    throw new ValidationError('botId is required');
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    await botService.assertBotOwnership(user.id, botId);
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
