import { Node, Edge } from '@xyflow/react';

export type StartNodeData = {
  startCommand?: string;
};

export type ConditionNodeData = {
  questionNodeId: string;
  operator: 'equals' | 'contains';
  value: string;
};

export type EndNodeData = {
  message?: string;
};

export type MessageNodeData = {
  text: string;
  attachmentIds?: string[];
};

export type QuestionNodeData = {
  text: string;
  answerLabel: string;
  attachmentIds?: string[];
};

export type ChoiceButton = {
  id: string;
  text: string;
};

export type ChoiceNodeData = {
  text: string;
  buttons: ChoiceButton[];
  attachmentIds?: string[];
};

export type SummaryNodeData = {
  introText?: string;
  includedQuestionIds: string[];
  customTemplate?: string;
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
