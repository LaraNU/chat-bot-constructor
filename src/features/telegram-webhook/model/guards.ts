import type { AppNode, MessageAppNode, ConditionAppNode, EndAppNode } from '@/entities/workflow';

export function isMessageNode(node: AppNode): node is MessageAppNode {
  return node.type === 'message';
}

export function isConditionNode(node: AppNode): node is ConditionAppNode {
  return node.type === 'condition';
}

export function isEndNode(node: AppNode): node is EndAppNode {
  return node.type === 'end';
}
