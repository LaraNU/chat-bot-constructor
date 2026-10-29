'use client';

import {
  ReactFlow,
  Background,
  Controls,
  type EdgeProps,
  type IsValidConnection,
  MarkerType,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useCallback, useMemo } from 'react';

import {
  NODE_TYPES,
  CustomEdge,
  isOutputOccupied,
  wouldCreateUnsafeCycle,
} from '@/entities/workflow';

import {
  useWorkflowNodes,
  useWorkflowEdges,
  useNodesChange,
  useEdgesChange,
  useConnectNodes,
  useDeleteEdge,
  useSetNodes,
  useWorkflowStoreApi,
} from '@/entities/workflow/model/store';

import { useCanvasDragDrop } from '@/features/drag-drop-node';

import { WORKFLOW_EDGE } from '../model/constants';

type Props = {
  onNodeDoubleClick?: () => void;
};

export function WorkflowCanvas({ onNodeDoubleClick }: Props) {
  const nodes = useWorkflowNodes();
  const edges = useWorkflowEdges();

  const setNodes = useSetNodes();

  const onNodesChange = useNodesChange();
  const onEdgesChange = useEdgesChange();
  const onConnect = useConnectNodes();
  const deleteEdge = useDeleteEdge();

  const { onDrop, onDragOver } = useCanvasDragDrop(setNodes);

  const storeApi = useWorkflowStoreApi();

  // Rejects a connection from an output that already has an edge (each node
  // output has at most one) or one that would close a cycle without a waiting
  // node. React Flow normalizes drags started from a target handle, so both
  // directions are covered.
  // Runs on every pointer move while a connection is dragged: read the graph
  // at call time instead of re-creating the callback on each graph change.
  const isValidConnection = useCallback<IsValidConnection>(
    ({ source, sourceHandle, target }) => {
      const { nodes: currentNodes, edges: currentEdges } = storeApi.getState();

      if (isOutputOccupied(currentEdges, { source, sourceHandle })) {
        return false;
      }

      return !wouldCreateUnsafeCycle(currentNodes, currentEdges, { source, target });
    },
    [storeApi]
  );

  const edgeTypes = useMemo(
    () => ({
      custom: (props: EdgeProps) => <CustomEdge {...props} onDelete={deleteEdge} />,
    }),
    [deleteEdge]
  );

  const renderedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'custom' as const,
        markerEnd: {
          type: MarkerType.Arrow,
          color: edge.selected ? WORKFLOW_EDGE.selectedColor : WORKFLOW_EDGE.defaultColor,
          strokeWidth: WORKFLOW_EDGE.strokeWidth,
        },
      })),
    [edges]
  );

  return (
    <div className="bg-muted/5 relative h-full flex-1">
      <ReactFlow
        nodes={nodes}
        edges={renderedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={NODE_TYPES}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
