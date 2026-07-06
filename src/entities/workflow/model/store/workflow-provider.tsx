'use client';

import { useState } from 'react';

import type { AppEdge, CustomAppNode } from '../types';

import { WorkflowStoreContext } from './workflow-context';
import { createWorkflowStore } from './workflow-store';

interface WorkflowStoreProviderProps {
  nodes: CustomAppNode[];
  edges: AppEdge[];
  children: React.ReactNode;
}

export function WorkflowStoreProvider({ nodes, edges, children }: WorkflowStoreProviderProps) {
  const [store] = useState(() =>
    createWorkflowStore({
      nodes,
      edges,
    })
  );

  return <WorkflowStoreContext.Provider value={store}>{children}</WorkflowStoreContext.Provider>;
}
