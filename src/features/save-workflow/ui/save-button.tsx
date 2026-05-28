'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useStoreApi } from '@xyflow/react';

import { Button } from '@/shared/ui/button';
import { saveWorkflowAction } from '@/entities/workflow';
import type { AppEdge, AppNode } from '@/entities/workflow/model/types';

interface SaveWorkflowButtonProps {
  botId: string;
}

export function SaveWorkflowButton({ botId }: SaveWorkflowButtonProps) {
  const t = useTranslations('WorkflowCanvas');
  const [isLoading, setIsLoading] = useState(false);

  const store = useStoreApi();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { nodes, edges } = store.getState();

      const result = await saveWorkflowAction({
        botId,
        nodes: nodes as AppNode[],
        edges: edges as AppEdge[],
      });

      if (result.success) {
        toast.success(t('messages.saveSuccess'));
      } else {
        toast.error(result.error || t('messages.saveError'));
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('messages.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSave} disabled={isLoading} size="sm" className="shadow-md">
      {isLoading ? t('savingButton') || '...' : t('saveButton')}
    </Button>
  );
}
