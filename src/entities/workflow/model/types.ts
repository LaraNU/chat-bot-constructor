import { Node, Edge } from '@xyflow/react';

export type NodeDataUpdatePayload =
  | Partial<MessageNodeData>
  | Partial<StartNodeData>
  | Partial<ConditionNodeData>
  | Partial<EndNodeData>;

export interface WorkflowNodeActionHandlers {
  onNodeDelete: (id: string) => void;
  onNodeUpdate: (id: string, data: NodeDataUpdatePayload) => void;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  actions?: WorkflowNodeActionHandlers;
}

export type StartNodeData = WorkflowNodeData & {
  triggerType: 'manual' | 'message';
};

export type ConditionNodeData = WorkflowNodeData & {
  variable: 'message_text' | 'username' | 'callback_data';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
  value: string;
};

export type EndNodeData = WorkflowNodeData & {
  message?: string;
};

export type InlineButton = {
  id: string;
  text: string;
  value: string;
};

export type MessageNodeData = WorkflowNodeData & {
  label?: string;
  text: string;
  shouldSaveResponse?: boolean;
  saveToVariable?: string;
  buttons?: InlineButton[];
};

export type MessageAppNode = Node<MessageNodeData, 'message'>;
export type StartAppNode = Node<StartNodeData, 'start'>;
export type ConditionAppNode = Node<ConditionNodeData, 'condition'>;
export type EndAppNode = Node<EndNodeData, 'end'>;

export type CustomAppNode = MessageAppNode | StartAppNode | ConditionAppNode | EndAppNode;
export type AppNode = CustomAppNode;

export type AppEdge = Edge;

export type WorkflowNodeType = 'start' | 'message' | 'condition' | 'end';

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace PrismaJson {
    type WorkflowNodes = AppNode[];
    type WorkflowEdges = AppEdge[];
  }
}
