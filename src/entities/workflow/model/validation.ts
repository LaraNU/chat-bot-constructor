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

const summaryNodeDataSchema = z.object({
  introText: trimmedNonEmptyString('Summary intro text cannot be empty'),
  includedQuestionIds: z.array(z.string()),
  customTemplate: z.string().optional(),
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

/** Strict node schemas — used at publish time to enforce non-empty content. */
const appNodeSchema = z.discriminatedUnion('type', [
  baseNodeSchema.extend({ type: z.literal('start'), data: startNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('end'), data: endNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('message'), data: messageNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('condition'), data: conditionNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('question'), data: questionNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('choice'), data: choiceNodeDataSchema }),
  baseNodeSchema.extend({ type: z.literal('summary'), data: summaryNodeDataSchema }),
]);

/** Draft node schema — validates structure only, allows empty data fields. */
const draftNodeSchema = baseNodeSchema.extend({
  type: z.union([
    z.literal('start'),
    z.literal('end'),
    z.literal('message'),
    z.literal('condition'),
    z.literal('question'),
    z.literal('choice'),
    z.literal('summary'),
  ]),
  data: z.record(z.string(), z.unknown()),
});

const appEdgeSchema = z.object({
  id: z.string(),
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});

/** Strict schema for publish — all node data fields must be valid and non-empty. */
export const workflowSchema = z.object({
  botId: z.uuid({ message: 'botId must be a valid UUID' }),
  nodes: z.array(appNodeSchema),
  edges: z.array(appEdgeSchema),
});

/** Draft schema for save — validates structure only (id, type, position, edge refs). */
export const draftWorkflowSchema = z.object({
  botId: z.uuid({ message: 'botId must be a valid UUID' }),
  nodes: z.array(draftNodeSchema),
  edges: z.array(appEdgeSchema),
});

export type WorkflowPayload = z.infer<typeof workflowSchema>;
