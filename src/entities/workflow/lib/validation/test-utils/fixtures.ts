import type {
  AppEdge,
  AppNode,
  ChoiceNodeData,
  ConditionNodeData,
  MessageNodeData,
  QuestionNodeData,
  SummaryNodeData,
} from '../../../model/types';

export function makeStartNode(id = 'start-1'): AppNode {
  return { id, type: 'start', position: { x: 0, y: 0 }, data: {} };
}

export function makeEndNode(id = 'end-1', message = 'Thank you!'): AppNode {
  return { id, type: 'end', position: { x: 0, y: 0 }, data: { message } };
}

export function makeMessageNode(id: string, data: Partial<MessageNodeData> = {}): AppNode {
  return {
    id,
    type: 'message',
    position: { x: 0, y: 0 },
    data: { text: 'Hello!', ...data },
  };
}

export function makeQuestionNode(id: string, data: Partial<QuestionNodeData> = {}): AppNode {
  return {
    id,
    type: 'question',
    position: { x: 0, y: 0 },
    data: { text: 'What is your name?', answerLabel: 'Name', ...data },
  };
}

export function makeConditionNode(id: string, data: Partial<ConditionNodeData> = {}): AppNode {
  return {
    id,
    type: 'condition',
    position: { x: 0, y: 0 },
    data: { questionNodeId: 'q-1', operator: 'equals', value: 'yes', ...data },
  };
}

export function makeChoiceNode(id: string, data: Partial<ChoiceNodeData> = {}): AppNode {
  return {
    id,
    type: 'choice',
    position: { x: 0, y: 0 },
    data: {
      text: 'Pick one:',
      buttons: [
        { id: 'btn-a', text: 'Option A' },
        { id: 'btn-b', text: 'Option B' },
      ],
      ...data,
    },
  };
}

export function makeSummaryNode(id: string, data: Partial<SummaryNodeData> = {}): AppNode {
  return {
    id,
    type: 'summary',
    position: { x: 0, y: 0 },
    data: { includedQuestionIds: [], introText: 'Summary:', ...data },
  };
}

export function makeEdge(
  id: string,
  source: string,
  target: string,
  sourceHandle?: string
): AppEdge {
  return { id, source, target, sourceHandle };
}

/**
 * Minimal valid linear workflow: start → message → end.
 * isValid should be true with no issues.
 */
export function makeValidLinearWorkflow(): { nodes: AppNode[]; edges: AppEdge[] } {
  const nodes: AppNode[] = [
    makeStartNode('start-1'),
    makeMessageNode('msg-1'),
    makeEndNode('end-1'),
  ];

  const edges: AppEdge[] = [makeEdge('e1', 'start-1', 'msg-1'), makeEdge('e2', 'msg-1', 'end-1')];

  return { nodes, edges };
}
