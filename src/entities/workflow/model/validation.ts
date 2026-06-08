import { z } from 'zod';

const trimmedNonEmptyString = (emptyErrorMessage: string) =>
  z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: emptyErrorMessage });

const startNodeDataSchema = z.object({
  triggerType: z.enum(['manual', 'message']),
});

const endNodeDataSchema = z.object({
  message: trimmedNonEmptyString('End message text cannot be empty'),
});

const messageNodeDataSchema = z.object({
  label: z.string().optional(),
  text: trimmedNonEmptyString('Message text cannot be empty'),
});

const conditionNodeDataSchema = z.object({
  variable: z.enum(['message_text', 'username', 'callback_data']),
  operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan', 'exists']),
  value: trimmedNonEmptyString('Condition value cannot be empty'),
});

const baseNodeSchema = z.object({
  id: z.uuid({ message: 'Node ID must be a valid UUID' }),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  measured: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

const appNodeSchema = z.discriminatedUnion('type', [
  baseNodeSchema.extend({ type: z.literal('start'), data: startNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('end'), data: endNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('message'), data: messageNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('condition'), data: conditionNodeDataSchema }),
]);

const appEdgeSchema = z.object({
  id: z.string(),
  source: z.uuid(),
  target: z.uuid(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});

export const workflowSchema = z.object({
  botId: z.uuid({ message: 'botId must be a valid UUID' }),
  nodes: z.array(appNodeSchema),
  edges: z.array(appEdgeSchema),
});

export type WorkflowPayload = z.infer<typeof workflowSchema>;
