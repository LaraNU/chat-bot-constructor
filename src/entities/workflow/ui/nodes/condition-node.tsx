'use client';

import { memo, useCallback, useMemo } from 'react';
import { Trash2, Frown, Smile } from 'lucide-react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

import type { AppNode, ConditionAppNode, ConditionNodeData } from '../../model/types';

import { buildQuestionOptions } from '../../lib';
import { ControlledInput } from '@/shared/ui/controlled-input';
import { useTranslations } from 'next-intl';
import { useNodeMutations } from '../../model/store';
import { WorkflowNodeIcon } from '../workflow-node-icon';

export const ConditionNode = memo(({ id, data }: NodeProps<ConditionAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.condition');
  const { remove, patch, commit } = useNodeMutations<ConditionAppNode['data']>(id);

  const nodes = useStore((state) => state.nodes as AppNode[]);

  const availableQuestions = useMemo(
    () => buildQuestionOptions(nodes, (id) => t('questionFallback', { id })),
    [nodes, t]
  );

  const handleQuestionChange = useCallback(
    (value: string) => {
      patch({ questionNodeId: value });
    },
    [patch]
  );

  const handleOperatorChange = useCallback(
    (value: string) => {
      patch({ operator: value as ConditionNodeData['operator'] });
    },
    [patch]
  );

  return (
    <BaseNode className="w-80 pb-5">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <WorkflowNodeIcon type="condition" />

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
          onClick={remove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="mb-1 block text-[10px] font-bold uppercase">{t('question')}</Label>

          <Select value={data.questionNodeId} onValueChange={handleQuestionChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={t('selectQuestion')} />
            </SelectTrigger>

            <SelectContent>
              {availableQuestions.map((question) => (
                <SelectItem key={question.value} value={question.value}>
                  {question.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block text-[10px] font-bold uppercase">{t('check')}</Label>

          <Select value={data.operator} onValueChange={handleOperatorChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="equals">{t('operators.equals')}</SelectItem>

              <SelectItem value="contains">{t('operators.contains')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block text-[10px] font-bold uppercase">{t('value')}</Label>

          <ControlledInput
            value={data.value}
            placeholder={t('valuePlaceholder')}
            onCommit={commit('value')}
          />
        </div>
      </BaseNodeContent>

      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        className="!size-6 !border-0 !bg-white"
        style={{
          left: '25%',
        }}
      >
        <Smile color="#439400" />
      </Handle>

      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        className="!size-6 !border-0 !bg-white"
        style={{
          left: '75%',
        }}
      >
        <Frown color="#940000" />
      </Handle>
    </BaseNode>
  );
});

ConditionNode.displayName = 'ConditionNode';
