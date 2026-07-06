'use client';

import type { StoreApi } from 'zustand';
import type { WorkflowStore } from './workflow-store';
import { createContext } from 'react';

export const WorkflowStoreContext = createContext<StoreApi<WorkflowStore> | null>(null);
