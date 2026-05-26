'use client';

import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';

import { NODE_TYPES } from './node-types';
import type { AppEdge, AppNode } from '@/entities/workflow';

import { useCanvasDragDrop } from '@/features/drag-drop-node';

import { WorkflowActionsContext, useWorkflowCore } from '@/features/workflow-actions';

interface WorkflowCanvasProps {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
}

export function WorkflowCanvas({ initialNodes, initialEdges }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  const { onNodeDelete, onNodeUpdate, onConnect } = useWorkflowCore({
    setNodes,
    setEdges,
  });

  const { onDrop, onDragOver } = useCanvasDragDrop(setNodes);

  const actionsValue = useMemo(
    () => ({
      onNodeDelete,
      onNodeUpdate,
    }),
    [onNodeDelete, onNodeUpdate]
  );

  return (
    <WorkflowActionsContext.Provider value={actionsValue}>
      <div className="bg-muted/5 relative h-full flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </WorkflowActionsContext.Provider>
  );
}
