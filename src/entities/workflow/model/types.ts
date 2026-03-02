import { Node, Edge } from '@xyflow/react';

export type MessageNodeData = {
  label?: string;
  text: string;
  onChange: (text: string) => void;
};

export type StartNodeData = {
  triggerType: 'manual' | 'message';
};

export type AppNode = Node<
  MessageNodeData | StartNodeData,
  'message' | 'start' | 'condition' | 'end'
>;
export type AppEdge = Edge;
