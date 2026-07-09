import type { WorkflowNodeType } from '../../../model/types';

import type { NodeDataValidator } from '../types';

import { conditionNodeValidator } from './condition-validator';
import { choiceNodeValidator } from './choice-validator';
import { summaryNodeValidator } from './summary-validator';

/**
 * Registry of per-node data validators keyed by node type.
 *
 * Adding a validator for a new node type requires only a single line here.
 * The validateNodeData pipeline picks it up automatically.
 */
export const NODE_DATA_VALIDATORS: Partial<Record<WorkflowNodeType, NodeDataValidator>> = {
  condition: conditionNodeValidator,
  choice: choiceNodeValidator,
  summary: summaryNodeValidator,
};
