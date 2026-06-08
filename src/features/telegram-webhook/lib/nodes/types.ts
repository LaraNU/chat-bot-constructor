import type { AppNode, AppEdge } from '@/entities/workflow';
import type { UserContext } from '../../model/types';

/**
 * Временные данные, сохраняемые в течение выполнения workflow
 */
export interface TempData {
  answers: Record<string, string>;
  [key: string]: Record<string, string> | string | number | boolean | null | undefined;
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
  /**
   * ID следующей ноды, которую нужно выполнить.
   * null если workflow должен завершиться
   */
  nextNodeId: string | null;
  /**
   * Флаг, указывает ли обработчик, что это точка остановки
   * (например, после отправки сообщения ждём ответа пользователя)
   */
  shouldStop?: boolean;
}

/**
 * Параметры для обработчика ноды (для обратной совместимости)
 */
export interface NodeHandlerParams {
  node: AppNode;
  edges: AppEdge[];
  nodes: AppNode[];
  context: UserContext;
  tempData: TempData;
}

/**
 * Интерфейс для реализации стратегии обработки ноды
 */
export interface NodeHandler {
  handle(params: NodeHandlerParams): Promise<NodeHandlerResult>;
}
