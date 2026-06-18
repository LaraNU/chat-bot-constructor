import type { AppNode, AppEdge } from '@/entities/workflow';
import type { UserContext } from '../../model/types';

/**
 * Ответ пользователя на конкретную message-ноду
 */
export interface SavedAnswer {
  nodeId: string;
  text?: string;
  buttonId?: string;
  buttonText?: string;
}

/**
 * Временные данные выполнения workflow
 */
export interface TempData {
  answers: Record<string, SavedAnswer>;

  responses: Array<{
    question: string;
    answer: string;
  }>;

  uploadedFileId?: string;
  uploadedFileType?: string;
}

/**
 * Контекст выполнения для всех обработчиков
 */
export interface ExecutionContext {
  nodes: AppNode[];
  edges: AppEdge[];
  userContext: UserContext;
  tempData: TempData;
}

/**
 * Результат выполнения обработчика ноды
 */
export interface NodeHandlerResult {
  nextNodeId: string | null;
  shouldStop?: boolean;
}

/**
 * Параметры обработчика ноды
 */
export interface NodeHandlerParams {
  node: AppNode;
  edges: AppEdge[];
  nodes: AppNode[];
  nodesById: Map<string, AppNode>;
  edgesBySource: Map<string, AppEdge[]>;
  context: UserContext;
  tempData: TempData;
  initialNodeId: string | null;
}

export interface NodeHandler {
  handle(params: NodeHandlerParams): Promise<NodeHandlerResult>;
}
