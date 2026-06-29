'use client';

import { Textarea } from '@/shared/ui/textarea';
import { Heading } from '@/shared/ui/typography';

import type { MessageAppNode } from '@/entities/workflow/model/types';

import { useWorkflowStore } from '@/entities/workflow/model/store';
import { useTranslations } from 'next-intl';
import type { ChangeEvent } from 'react';

interface MessagePropertiesProps {
  node: MessageAppNode;
}

export function MessageProperties({ node }: MessagePropertiesProps) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const t = useTranslations('WorkflowEditor.nodes.message');

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(node.id, {
      text: e.target.value,
    });
  };

  return (
    <div className="space-y-2 p-4">
      <Heading level={5}>{t('name')}</Heading>

      <Textarea
        className="[field-sizing:content] min-h-[80px] resize-none"
        value={node.data.text}
        placeholder={t('messagePlaceholder')}
        onChange={handleTextChange}
      />
      <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
    </div>
  );
}
