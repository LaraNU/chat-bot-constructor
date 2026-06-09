'use client';

import { memo } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';

import type { StartAppNode, StartNodeData } from '../../model/types';

interface TriggerOption {
  value: StartNodeData['triggerType'];
  translationKey: 'message' | 'manual';
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  { value: 'message', translationKey: 'message' },
  { value: 'manual', translationKey: 'manual' },
];

export const StartNode = memo(({ id, data }: NodeProps<StartAppNode>) => {
  const t = useTranslations('WorkflowEditor');

  const handleDelete = () => {
    data.actions?.onNodeDelete(id);
  };

  const handleUpdate = (payload: Partial<StartNodeData>) => {
    data.actions?.onNodeUpdate(id, payload);
  };

  return (
    <BaseNode className="w-64">
      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${WORKFLOW_NODES_CONFIG.start.color}`}>
          <Play className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">
          {t('nodes.start.name')}
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
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.start.triggerLabel') || 'Trigger Type'}
          </Label>

          <Select
            value={data.triggerType ?? 'message'}
            onValueChange={(value) =>
              handleUpdate({ triggerType: value as StartNodeData['triggerType'] })
            }
          >
            <SelectTrigger className="nodrag h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_OPTIONS.map(({ value, translationKey }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {t(`nodes.start.triggers.${translationKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

StartNode.displayName = 'StartNode';
