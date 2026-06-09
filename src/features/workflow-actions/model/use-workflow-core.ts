'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { addEdge, Connection } from '@xyflow/react';
import type { AppNode, AppEdge } from '@/entities/workflow/model/types';
import type { NodeDataUpdatePayload } from './context';

interface UseWorkflowCoreProps {
  setNodes: Dispatch<SetStateAction<AppNode[]>>;
  setEdges: Dispatch<SetStateAction<AppEdge[]>>;
}

/**
 * Type-safe node update function that preserves node type
 */
function updateNodeData<T extends AppNode>(node: T, newData: NodeDataUpdatePayload): T {
  return {
    ...node,
    data: {
      ...node.data,
      ...newData,
    },
  } as T;
}

export const useWorkflowCore = ({ setNodes, setEdges }: UseWorkflowCoreProps) => {
  const onNodeDelete = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    },
    [setNodes, setEdges]
  );

  const onNodeUpdate = useCallback(
    (id: string, newData: NodeDataUpdatePayload) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return updateNodeData(node, newData);
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return {
    onNodeDelete,
    onNodeUpdate,
    onConnect,
  };
};
