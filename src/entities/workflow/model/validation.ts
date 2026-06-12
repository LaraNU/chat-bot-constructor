import { z } from 'zod';

const trimmedNonEmptyString = (emptyErrorMessage: string) =>
  z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: emptyErrorMessage });

const startNodeDataSchema = z.object({});

const endNodeDataSchema = z.object({
  message: trimmedNonEmptyString('End message text cannot be empty'),
});

const messageNodeDataSchema = z.object({
  text: trimmedNonEmptyString('Message text cannot be empty'),
  attachmentIds: z.array(z.string()).optional(),
});

const questionNodeDataSchema = z.object({
  text: trimmedNonEmptyString('Question text cannot be empty'),
  answerLabel: trimmedNonEmptyString('Answer label cannot be empty'),
  attachmentIds: z.array(z.string()).optional(),
});

const choiceNodeDataSchema = z.object({
  text: trimmedNonEmptyString('Choice text cannot be empty'),
  buttons: z.array(
    z.object({
      id: z.string(),
      text: trimmedNonEmptyString('Button text cannot be empty'),
    })
  ),
  attachmentIds: z.array(z.string()).optional(),
});

const conditionNodeDataSchema = z.object({
  questionNodeId: z.string().min(1),
  operator: z.enum(['equals', 'contains']),
  value: z
    .string()
    .transform((v) => v.trim())
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
  baseNodeSchema.extend({ type: z.literal('question'), data: questionNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('choice'), data: choiceNodeDataSchema }),
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
