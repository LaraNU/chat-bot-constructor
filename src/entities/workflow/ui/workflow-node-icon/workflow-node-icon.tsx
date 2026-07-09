'use client';

import {
  CircleHelp,
  ClipboardList,
  GitBranch,
  ListChecks,
  LucideIcon,
  MessageSquare,
  Play,
  StopCircle,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import type { NodeConfig } from '../../model/nodes-config';
import type { WorkflowNodeType } from '../../model/types';

export const WORKFLOW_NODE_ICON_MAP: Record<NodeConfig['iconName'], LucideIcon> = {
  play: Play,
  message: MessageSquare,
  question: CircleHelp,
  choice: ListChecks,
  branch: GitBranch,
  stop: StopCircle,
  summary: ClipboardList,
};

type WorkflowNodeIconProps = {
  type: WorkflowNodeType;
  size?: 'sm' | 'md';
  className?: string;
};

export function WorkflowNodeIcon({ type, size = 'sm', className }: WorkflowNodeIconProps) {
  const config = WORKFLOW_NODES_CONFIG[type];
  const Icon = WORKFLOW_NODE_ICON_MAP[config.iconName];

  return (
    <div
      className={cn(
        'border',
        config.color,
        size === 'sm' && 'rounded-sm p-1',
        size === 'md' && 'flex h-8 w-8 items-center justify-center rounded-md',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'size-3.5' : 'h-4 w-4'} />
    </div>
  );
}
