'use client';

import { ReactFlow, Background, Controls, type EdgeProps, MarkerType } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useMemo } from 'react';

import { NODE_TYPES, CustomEdge } from '@/entities/workflow';

import {
  useWorkflowNodes,
  useWorkflowEdges,
  useNodesChange,
  useEdgesChange,
  useConnectNodes,
  useDeleteEdge,
  useSetNodes,
} from '@/entities/workflow/model/store';

import { useCanvasDragDrop } from '@/features/drag-drop-node';

import { WORKFLOW_EDGE } from '../model/constants';

export function WorkflowCanvas() {
  const nodes = useWorkflowNodes();
  const edges = useWorkflowEdges();

  const setNodes = useSetNodes();

  const onNodesChange = useNodesChange();
  const onEdgesChange = useEdgesChange();
  const onConnect = useConnectNodes();
  const deleteEdge = useDeleteEdge();

  const { onDrop, onDragOver } = useCanvasDragDrop(setNodes);

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
        onDrop={onDrop}
        onDragOver={onDragOver}
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
