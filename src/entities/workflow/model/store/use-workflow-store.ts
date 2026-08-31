'use client';

import { useContext } from 'react';
import { useStore } from 'zustand';

import { WorkflowStoreContext } from './workflow-context';
import type { WorkflowStore } from './workflow-store';

export function useWorkflowStore<T>(selector: (state: WorkflowStore) => T): T {
  const store = useContext(WorkflowStoreContext);

  if (!store) {
    throw new Error('useWorkflowStore must be used inside WorkflowStoreProvider');
  }

  return useStore(store, selector);
}

/** Returns the raw Zustand StoreApi — use `.getState()` inside callbacks to read fresh values. */
export function useWorkflowStoreApi() {
  const store = useContext(WorkflowStoreContext);

  if (!store) {
    throw new Error('useWorkflowStoreApi must be used inside WorkflowStoreProvider');
  }

  return store;
}
