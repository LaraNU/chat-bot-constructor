import type { AppNode, QuestionAppNode } from '../model/types';

export type QuestionOption = {
  value: string;
  label: string;
};

export function buildQuestionOptions(
  nodes: AppNode[],
  questionFallback: (id: string) => string
): QuestionOption[] {
  return nodes
    .filter((node): node is QuestionAppNode => node.type === 'question')
    .map((node) => ({
      value: node.id,
      label: node.data.text?.slice(0, 60) || questionFallback(node.id.slice(0, 8)),
    }));
}
