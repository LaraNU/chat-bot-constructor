import type { QuestionAppNode } from '../model/types';

export function getQuestionLabel(node: QuestionAppNode): string {
  return node.data.answerLabel?.trim() || node.data.text?.trim() || `Вопрос ${node.id.slice(0, 8)}`;
}
