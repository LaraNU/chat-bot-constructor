import { z } from 'zod';
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
