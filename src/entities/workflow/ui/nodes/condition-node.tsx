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
import { NodeInput } from './fields/node-input';

type VariableType = ConditionNodeData['variable'];
type OperatorType = ConditionNodeData['operator'];

interface VariableOption {
  value: VariableType;
  translationKey: 'messageText' | 'username' | 'callbackData';
}

interface OperatorOption {
  value: OperatorType;
  translationKey: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
}

const VARIABLE_OPTIONS: VariableOption[] = [
  { value: 'message_text', translationKey: 'messageText' },
  { value: 'username', translationKey: 'username' },
  { value: 'callback_data', translationKey: 'callbackData' },
];

const OPERATOR_OPTIONS: OperatorOption[] = [
  { value: 'equals', translationKey: 'equals' },
  { value: 'contains', translationKey: 'contains' },
  { value: 'greaterThan', translationKey: 'greaterThan' },
  { value: 'lessThan', translationKey: 'lessThan' },
  { value: 'exists', translationKey: 'exists' },
];

export const ConditionNode = memo(({ id, data }: NodeProps<ConditionAppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const config = WORKFLOW_NODES_CONFIG.condition;

  const handleDelete = () => {
    data.actions?.onNodeDelete(id);
  };

  const handleUpdate = (nodeId: string, payload: Partial<ConditionNodeData>) => {
    data.actions?.onNodeUpdate(nodeId, payload);
  };

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
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-3 p-3">
        {/* Variable Select */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.condition.variable') || 'Variable'}
          </Label>
          <Select
            value={data.variable ?? ''}
            onValueChange={(val: string) => handleUpdate(id, { variable: val as VariableType })}
          >
            <SelectTrigger className="nodrag h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VARIABLE_OPTIONS.map(({ value, translationKey }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {t(`variables.${translationKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator Select */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.condition.operator') || 'Operator'}
          </Label>
          <Select
            value={data.operator ?? ''}
            onValueChange={(val: string) => handleUpdate(id, { operator: val as OperatorType })}
          >
            <SelectTrigger className="nodrag h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATOR_OPTIONS.map(({ value, translationKey }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {t(`operators.${translationKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value Input */}
        {data.operator !== 'exists' && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
              {t('nodes.condition.value') || 'Value'}
            </Label>
            <NodeInput<ConditionNodeData, 'value'>
              nodeId={id}
              field="value"
              initialValue={data.value ?? ''}
              placeholder={t('nodes.condition.valuePlaceholder') || 'e.g., "Buy"'}
              onUpdate={handleUpdate}
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
