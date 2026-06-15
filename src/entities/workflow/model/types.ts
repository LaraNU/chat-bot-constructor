import { Node, Edge } from '@xyflow/react';

export type NodeDataUpdatePayload =
  | Partial<MessageNodeData>
  | Partial<StartNodeData>
  | Partial<ConditionNodeData>
  | Partial<SummaryNodeData>
  | Partial<EndNodeData>;

export interface WorkflowNodeActionHandlers {
  onNodeDelete: (id: string) => void;
  onNodeUpdate: (id: string, data: NodeDataUpdatePayload) => void;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  actions?: WorkflowNodeActionHandlers;
}

export type StartNodeData = WorkflowNodeData;

export type ConditionNodeData = WorkflowNodeData & {
  questionNodeId: string;
  operator: 'equals' | 'contains';
  value: string;

  actions?: WorkflowNodeActionHandlers;
};

export type EndNodeData = WorkflowNodeData & {
  message?: string;
};

export type MessageNodeData = WorkflowNodeData & {
  text: string;
  attachmentIds?: string[];
};

export type QuestionNodeData = WorkflowNodeData & {
  text: string;
  answerLabel: string;
  attachmentIds?: string[];
};

export type ChoiceButton = {
  id: string;
  text: string;
};

export type ChoiceNodeData = WorkflowNodeData & {
  text: string;
  buttons: ChoiceButton[];
  attachmentIds?: string[];
};

export type SummaryNodeData = WorkflowNodeData & {
  introText?: string;
  includedQuestionIds: string[];
  customTemplate?: string;
  actions?: WorkflowNodeActionHandlers;
};

export type SummaryAppNode = Node<SummaryNodeData, 'summary'>;
export type MessageAppNode = Node<MessageNodeData, 'message'>;
export type StartAppNode = Node<StartNodeData, 'start'>;
export type ConditionAppNode = Node<ConditionNodeData, 'condition'>;
export type EndAppNode = Node<EndNodeData, 'end'>;
export type QuestionAppNode = Node<QuestionNodeData, 'question'>;
export type ChoiceAppNode = Node<ChoiceNodeData, 'choice'>;

export type CustomAppNode =
  | MessageAppNode
  | StartAppNode
  | ConditionAppNode
  | EndAppNode
  | QuestionAppNode
  | ChoiceAppNode
  | SummaryAppNode;
export type AppNode = CustomAppNode;

export type AppEdge = Edge;

export type WorkflowNodeType =
  | 'start'
  | 'message'
  | 'question'
  | 'choice'
  | 'condition'
  | 'end'
  | 'summary';

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace PrismaJson {
    type WorkflowNodes = AppNode[];
    type WorkflowEdges = AppEdge[];
  }
}
