import { Node, Edge, BuiltInNode } from '@xyflow/react';

export type MessageNodeData = {
  label?: string;
  text: string;
};

export type StartNodeData = {
  triggerType: 'manual' | 'message';
};

export type MessageAppNode = Node<MessageNodeData, 'message'>;
export type StartAppNode = Node<StartNodeData, 'start'>;

export type AppNode = MessageAppNode | StartAppNode | BuiltInNode;
export type AppEdge = Edge;
