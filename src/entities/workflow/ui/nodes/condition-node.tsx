'use client';

import { memo } from 'react';
import { GitBranch, Trash2 } from 'lucide-react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';

import type { ConditionAppNode, ConditionNodeData } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useWorkflowActions } from '@/features/workflow-actions';
import { NodeInput } from './fields/node-input';

type VariableType = ConditionNodeData['variable'];
type OperatorType = ConditionNodeData['operator'];

export const ConditionNode = memo(({ id, data }: NodeProps<ConditionAppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const config = WORKFLOW_NODES_CONFIG.condition;
  const { onNodeUpdate, onNodeDelete } = useWorkflowActions();

  return (
    <BaseNode className="w-80">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <GitBranch className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">
          {t('nodes.condition.name')}
        </BaseNodeHeaderTitle>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
          onClick={() => onNodeDelete(id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-3 p-3">
        {/* Variable Select */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('condition.variable') || 'Variable'}
          </Label>
          <Select
            value={data.variable ?? ''}
            onValueChange={(val) => onNodeUpdate(id, { variable: val as VariableType })}
          >
            <SelectTrigger className="nodrag h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="message_text" className="text-xs">
                Message Text
              </SelectItem>
              <SelectItem value="username" className="text-xs">
                Username
              </SelectItem>
              <SelectItem value="callback_data" className="text-xs">
                Callback Data
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Operator Select */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('condition.operator') || 'Operator'}
          </Label>
          <Select
            value={data.operator ?? ''}
            onValueChange={(val) => onNodeUpdate(id, { operator: val as OperatorType })}
          >
            <SelectTrigger className="nodrag h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals" className="text-xs">
                =
              </SelectItem>
              <SelectItem value="contains" className="text-xs">
                Contains
              </SelectItem>
              <SelectItem value="exists" className="text-xs">
                Exists
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.operator !== 'exists' && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
              {t('condition.value') || 'Value'}
            </Label>
            <NodeInput
              nodeId={id}
              field="value"
              initialValue={data.value ?? ''}
              placeholder={t('condition.valuePlaceholder') || 'e.g., "Buy"'}
            />
          </div>
        )}
      </BaseNodeContent>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        className="!bg-success"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
        className="!bg-destructive"
      />
    </BaseNode>
  );
});

ConditionNode.displayName = 'ConditionNode';
