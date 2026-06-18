'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { addEdge, Connection } from '@xyflow/react';

import type { AppEdge, CustomAppNode } from '@/entities/workflow/model/types';

import type { NodeDataUpdatePayload } from './context';

interface UseWorkflowCoreProps {
  setNodes: Dispatch<SetStateAction<CustomAppNode[]>>;
  setEdges: Dispatch<SetStateAction<AppEdge[]>>;
}

/**
 * Type-safe node update function that preserves node type
 */
function updateNodeData<T extends CustomAppNode>(node: T, newData: NodeDataUpdatePayload): T {
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
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== id) {
            return node;
          }
          return updateNodeData(node, newData);
        })
      );
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((edges) =>
        addEdge(
          {
            ...connection,
            type: 'custom',
            animated: false,
          },
          edges
        )
      );
    },
    [setEdges]
  );

  const onEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  return {
    onNodeDelete,
    onNodeUpdate,
    onConnect,
    onEdgeDelete,
  };
};
