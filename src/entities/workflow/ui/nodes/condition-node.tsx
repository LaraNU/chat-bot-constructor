'use client';

import { memo, useCallback } from 'react';
import { GitBranch, Trash2 } from 'lucide-react';
import { NodeProps, Handle, Position, useReactFlow } from '@xyflow/react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { ConditionAppNode } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';

type OperatorOption = {
  value: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
  label: string;
};

export const ConditionNode = memo(({ id, data }: NodeProps<ConditionAppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const config = WORKFLOW_NODES_CONFIG.condition;
  const { setNodes } = useReactFlow();

  const operators: OperatorOption[] = [
    { value: 'equals', label: t('operators.equals') || '=' },
    { value: 'contains', label: t('operators.contains') || 'Contains' },
    { value: 'greaterThan', label: t('operators.greaterThan') || '>' },
    { value: 'lessThan', label: t('operators.lessThan') || '<' },
    { value: 'exists', label: t('operators.exists') || 'Exists' },
  ];

  const handleVariableChange = (val: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, variable: val } };
        }
        return node;
      })
    );
  };

  const handleOperatorChange = (val: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              operator: val as 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists',
            },
          };
        }
        return node;
      })
    );
  };

  const handleValueChange = (val: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, value: val } };
        }
        return node;
      })
    );
  };

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  }, [id, setNodes]);

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
        {/* Variable Input */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('condition.variable') || 'Variable'}
          </Label>
          <Input
            className="nodrag nowheel h-8 text-xs"
            placeholder={t('condition.variablePlaceholder') || 'e.g., message_text'}
            value={data.variable ?? ''}
            onChange={(e) => handleVariableChange(e.target.value)}
          />
        </div>

        {/* Operator Select */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('condition.operator') || 'Operator'}
          </Label>
          <Select value={data.operator ?? ''} onValueChange={handleOperatorChange}>
            <SelectTrigger className="nodrag h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value Input (not needed for 'exists' operator) */}
        {data.operator !== 'exists' && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
              {t('condition.value') || 'Value'}
            </Label>
            <Input
              className="nodrag nowheel h-8 text-xs"
              placeholder={t('condition.valuePlaceholder') || 'e.g., "Buy"'}
              value={data.value ?? ''}
              onChange={(e) => handleValueChange(e.target.value)}
            />
          </div>
        )}
      </BaseNodeContent>

      {/* True output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        className="!bg-success"
      />

      {/* False output */}
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
