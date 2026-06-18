'use client';

import { memo, useCallback, useMemo } from 'react';
import { GitBranch, Trash2, Frown, Smile } from 'lucide-react';
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

import type {
  AppNode,
  ConditionAppNode,
  ConditionNodeData,
  QuestionAppNode,
} from '../../model/types';

import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { CommitInput } from './fields';
import { useTranslations } from 'next-intl';
import { useWorkflowActions } from '@/features/workflow-actions/model/context';

function buildQuestionOptions(nodes: AppNode[], t: ReturnType<typeof useTranslations>) {
  return nodes
    .filter((node): node is QuestionAppNode => node.type === 'question')
    .map((node) => ({
      value: node.id,
      label: node.data.text?.slice(0, 60) || t('questionFallback', { id: node.id.slice(0, 8) }),
    }));
}

export const ConditionNode = memo(({ id, data }: NodeProps<ConditionAppNode>) => {
  const config = WORKFLOW_NODES_CONFIG.condition;
  const t = useTranslations('WorkflowEditor.nodes.condition');
  const { onNodeDelete, onNodeUpdate } = useWorkflowActions();

  const nodes = useStore((state) => state.nodes as AppNode[]);

  const availableQuestions = useMemo(() => buildQuestionOptions(nodes, t), [nodes, t]);

  const handleDelete = () => {
    onNodeDelete(id);
  };

  const handleUpdate = useCallback(
    (nodeId: string, payload: Partial<ConditionNodeData>) => {
      onNodeUpdate(nodeId, payload);
    },
    [onNodeUpdate]
  );

  const handleValueCommit = useCallback(
    (value: string) => {
      handleUpdate(id, { value });
    },
    [handleUpdate, id]
  );

  const handleQuestionChange = useCallback(
    (value: string) => {
      handleUpdate(id, {
        questionNodeId: value,
      });
    },
    [handleUpdate, id]
  );

  const handleOperatorChange = useCallback(
    (value: string) => {
      handleUpdate(id, {
        operator: value as ConditionNodeData['operator'],
      });
    },
    [handleUpdate, id]
  );

  return (
    <BaseNode className="w-80 pb-5">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <GitBranch className="size-3.5" />
        </div>

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
          onClick={handleDelete}
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

          <CommitInput
            value={data.value}
            placeholder={t('valuePlaceholder')}
            onCommit={handleValueCommit}
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
