'use client';

import { createContext, useContext } from 'react';

import type {
  MessageNodeData,
  StartNodeData,
  ConditionNodeData,
  SummaryNodeData,
  EndNodeData,
  ChoiceNodeData,
  QuestionNodeData,
} from '@/entities/workflow/model/types';

export type NodeDataUpdatePayload =
  | Partial<MessageNodeData>
  | Partial<StartNodeData>
  | Partial<ConditionNodeData>
  | Partial<SummaryNodeData>
  | Partial<EndNodeData>
  | Partial<QuestionNodeData>
  | Partial<ChoiceNodeData>;

interface WorkflowActionsContextType {
  onNodeDelete: (id: string) => void;
  onNodeUpdate: (id: string, data: NodeDataUpdatePayload) => void;
  onEdgeDelete: (edgeId: string) => void;
}

export const WorkflowActionsContext = createContext<WorkflowActionsContextType | null>(null);

export function useWorkflowActions() {
  const context = useContext(WorkflowActionsContext);

  if (!context) {
    throw new Error('useWorkflowActions must be used within WorkflowActionsContext');
  }

  return context;
}
