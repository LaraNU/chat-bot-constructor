/**
 * Экспорты для работы с обработчиками нод через паттерн Strategy
 */

// Типы
export type {
  TempData,
  ExecutionContext,
  NodeHandlerResult,
  NodeHandlerParams,
  NodeHandler,
} from './types';

// Обработчики
export { messageHandler } from './message-handler';
export { conditionHandler } from './condition-handler';
export { endHandler } from './end-handler';

// Реестр
export { nodeHandlersRegistry, getNodeHandler } from './registry';
