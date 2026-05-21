'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { saveWorkflowAction } from '@/entities/workflow';
import type { AppEdge, AppNode } from '@/entities/workflow';

interface SaveWorkflowButtonProps {
  botId: string;
  nodes: AppNode[];
  edges: AppEdge[];
}

export function SaveWorkflowButton({ botId, nodes, edges }: SaveWorkflowButtonProps) {
  const t = useTranslations('WorkflowCanvas');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveWorkflowAction({ botId, nodes, edges });
      toast.success(t('messages.saveSuccess'));
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
