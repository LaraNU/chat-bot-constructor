import type { WorkflowNodeType } from './types';

export interface NodeConfig {
  translationKey: string;
  iconName: 'play' | 'message' | 'branch' | 'stop' | 'question' | 'choice';
  color: string;
}

export const WORKFLOW_NODES_CONFIG: Record<WorkflowNodeType, NodeConfig> = {
  start: {
    translationKey: 'nodes.start',
    iconName: 'play',
    color: 'bg-success/15 text-success border-success/30',
  },
  message: {
    translationKey: 'nodes.message',
    iconName: 'message',
    color: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  },
  question: {
    translationKey: 'nodes.question',
    iconName: 'question',
    color: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
  },
  choice: {
    translationKey: 'nodes.choice',
    iconName: 'choice',
    color: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  },
  condition: {
    translationKey: 'nodes.condition',
    iconName: 'branch',
    color: 'bg-warning/15 text-warning border-warning/30',
  },
  end: {
    translationKey: 'nodes.end',
    iconName: 'stop',
    color: 'bg-destructive/15 text-destructive border-destructive/30',
  },
} as const;
