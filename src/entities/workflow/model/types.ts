import { Node, Edge, BuiltInNode } from '@xyflow/react';

export type MessageNodeData = { label?: string; text: string };
export type StartNodeData = { triggerType: 'manual' | 'message' };
export type ConditionNodeData = {
  variable: 'message_text' | 'username' | 'callback_data';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
  value: string;
};
export type EndNodeData = { message?: string };

export type MessageAppNode = Node<MessageNodeData, 'message'>;
export type StartAppNode = Node<StartNodeData, 'start'>;
export type ConditionAppNode = Node<ConditionNodeData, 'condition'>;
export type EndAppNode = Node<EndNodeData, 'end'>;

export type AppNode = MessageAppNode | StartAppNode | ConditionAppNode | EndAppNode | BuiltInNode;
export type AppEdge = Edge;

export type WorkflowNodeType = 'start' | 'message' | 'condition' | 'end';

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace PrismaJson {
    type WorkflowNodes = AppNode[];
    type WorkflowEdges = AppEdge[];
  }
}
