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

const inlineButtonSchema = z.object({
  id: z.string().min(1, 'Button ID is required'),
  text: trimmedNonEmptyString('Button text cannot be empty'),
  value: trimmedNonEmptyString('Button value cannot be empty'),
});

const messageNodeDataSchema = z.object({
  label: z.string().optional(),
  text: trimmedNonEmptyString('Message text cannot be empty'),
  shouldSaveResponse: z.boolean().optional().default(false),
  saveToVariable: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  buttons: z.array(inlineButtonSchema).optional(),
});

const conditionNodeDataSchema = z.object({
  variable: z.string().min(1, 'Variable is required'),
  operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan', 'exists']),
  value: z
    .string()
    .transform((val) => val.trim())
    .default(''),
});

const baseNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
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
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});

export const workflowSchema = z.object({
  botId: z.uuid({ message: 'botId must be a valid UUID' }),
  nodes: z.array(appNodeSchema),
  edges: z.array(appEdgeSchema),
});

export type WorkflowPayload = z.infer<typeof workflowSchema>;
