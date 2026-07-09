import type { AppEdge, AppNode } from '../../model/types';

export type ValidationSeverity = 'error' | 'warning';

export type ValidationIssue = {
  severity: ValidationSeverity;
  /**
   * Machine-readable identifier used for assertions in tests and
   * as a stable key for i18n message lookup.
   */
  code: string;
  /**
   * Id of the node that caused this issue.
   * Undefined for graph-level issues that cannot be attributed to a single node.
   */
  nodeId?: string;
  /**
   * next-intl translation key, e.g. 'validation.noStartNode'.
   * No human-readable strings should be hardcoded in the domain layer.
   */
  messageKey: string;
  /**
   * Optional interpolation params forwarded to t(messageKey, messageParams).
   */
  messageParams?: Record<string, string>;
};

export type ValidationResult = {
  /** True when no issue has severity 'error'. Warnings are allowed. */
  isValid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
};

export type WorkflowGraph = {
  nodes: AppNode[];
  edges: AppEdge[];
};

/**
 * Function signature shared by all per-node data validators.
 * Receives the full graph context so cross-reference checks are possible.
 */
export type NodeDataValidator = (
  node: AppNode,
  nodes: AppNode[],
  edges: AppEdge[]
) => ValidationIssue[];
