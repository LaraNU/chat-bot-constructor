import { z } from 'zod';
import { Node, Edge, BuiltInNode } from '@xyflow/react';

export type MessageNodeData = {
  label?: string;
  text: string;
};

export type StartNodeData = {
  triggerType: 'manual' | 'message';
};

export type ConditionNodeData = {
  variable: 'message_text' | 'username' | 'callback_data';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
  value: string;
};

export type EndNodeData = {
  message?: string;
};

export type MessageAppNode = Node<MessageNodeData, 'message'>;
export type StartAppNode = Node<StartNodeData, 'start'>;
export type ConditionAppNode = Node<ConditionNodeData, 'condition'>;
export type EndAppNode = Node<EndNodeData, 'end'>;

export type AppNode = MessageAppNode | StartAppNode | ConditionAppNode | EndAppNode | BuiltInNode;
export type AppEdge = Edge;

// Prisma JSON types
export type PrismaJsonValue = null | boolean | number | string | PrismaJsonObject | PrismaJsonArray;
export type PrismaJsonObject = { [key: string]: PrismaJsonValue };
export type PrismaJsonArray = PrismaJsonValue[];

export const workflowSchema = z.object({
  botId: z.string().uuid({ message: 'botId must be a valid uuid' }),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export type WorkflowPayload = z.infer<typeof workflowSchema>;

// For API responses
export type WorkflowData = {
  nodes: AppNode[];
  edges: AppEdge[];
};

// For database storage
export type WorkflowDbData = {
  nodes: PrismaJsonArray;
  edges: PrismaJsonArray;
};
