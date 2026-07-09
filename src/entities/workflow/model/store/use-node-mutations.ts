'use client';

import { useCallback } from 'react';

import type { NodeDataUpdatePayload } from '../types';

import { useDeleteNode, useUpdateNode } from './actions';

export function useNodeMutations<T extends NodeDataUpdatePayload>(nodeId: string) {
  const updateNode = useUpdateNode();
  const deleteNode = useDeleteNode();

  const remove = useCallback(() => {
    deleteNode(nodeId);
  }, [deleteNode, nodeId]);

  const patch = useCallback(
    (data: Partial<T>) => {
      updateNode(nodeId, data);
    },
    [updateNode, nodeId]
  );

  const commit = useCallback(
    <K extends keyof T>(field: K) =>
      (value: T[K]) => {
        updateNode(nodeId, { [field]: value } as NodeDataUpdatePayload);
      },
    [updateNode, nodeId]
  );

  return { remove, patch, commit };
}
