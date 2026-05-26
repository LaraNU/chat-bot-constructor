'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { addEdge, Connection } from '@xyflow/react';
import type {
  AppNode,
  AppEdge,
  MessageNodeData,
  StartNodeData,
  ConditionNodeData,
  EndNodeData,
} from '@/entities/workflow/model/types';

export type NodeDataUpdatePayload = Partial<
  MessageNodeData & StartNodeData & ConditionNodeData & EndNodeData
>;

interface UseWorkflowCoreProps {
  setNodes: Dispatch<SetStateAction<AppNode[]>>;
  setEdges: Dispatch<SetStateAction<AppEdge[]>>;
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
        nds.map((node) =>
          node.id === id
            ? ({
                ...node,
                data: {
                  ...node.data,
                  ...newData,
                },
              } as AppNode)
            : node
        )
      );
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds) as AppEdge[]);
    },
    [setEdges]
  );

  return {
    onNodeDelete,
    onNodeUpdate,
    onConnect,
  };
};
