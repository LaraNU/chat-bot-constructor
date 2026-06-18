'use client';

import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  applyEdgeChanges,
  type EdgeChange,
  MarkerType,
  EdgeProps,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useMemo, useCallback } from 'react';

import { NODE_TYPES, CustomEdge } from '@/entities/workflow';
import type { AppEdge, CustomAppNode } from '@/entities/workflow/model/types';

import { useCanvasDragDrop } from '@/features/drag-drop-node';
import { useWorkflowCore, WorkflowActionsContext } from '@/features/workflow-actions';

interface WorkflowCanvasProps {
  initialNodes: CustomAppNode[];
  initialEdges: AppEdge[];
}

export function WorkflowCanvas({ initialNodes, initialEdges }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomAppNode>(initialNodes);

  const [edges, setEdges] = useEdgesState<AppEdge>(initialEdges);

  const { onNodeDelete, onNodeUpdate, onConnect, onEdgeDelete } = useWorkflowCore({
    setNodes,
    setEdges,
  });

  const contextValue = useMemo(
    () => ({
      onNodeDelete,
      onNodeUpdate,
      onEdgeDelete,
    }),
    [onNodeDelete, onNodeUpdate, onEdgeDelete]
  );

  const { onDrop, onDragOver } = useCanvasDragDrop(setNodes);

  const edgeTypes = useMemo(
    () => ({
      custom: (props: EdgeProps) => <CustomEdge {...props} onDelete={onEdgeDelete} />,
    }),
    [onEdgeDelete]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<AppEdge>[]) => {
      setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
    },
    [setEdges]
  );

  const renderedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'custom',
        markerEnd: {
          type: MarkerType.Arrow,
          color: edge.selected ? '#2284c5' : '#94a3b8',
          strokeWidth: 2,
        },
      })),
    [edges]
  );

  return (
    <WorkflowActionsContext.Provider value={contextValue}>
      <div className="bg-muted/5 relative h-full flex-1">
        <ReactFlow
          nodes={nodes}
          edges={renderedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          edgeTypes={edgeTypes}
          deleteKeyCode={['Backspace', 'Delete']}
          elementsSelectable
          fitView
          onlyRenderVisibleElements
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </WorkflowActionsContext.Provider>
  );
}
