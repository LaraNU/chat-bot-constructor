'use client';

import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';

import { NODE_TYPES } from '@/entities/workflow';
import type { AppEdge, CustomAppNode } from '@/entities/workflow/model/types';

import { useCanvasDragDrop } from '@/features/drag-drop-node';
import { useWorkflowCore } from '@/features/workflow-actions';

interface WorkflowCanvasProps {
  initialNodes: CustomAppNode[];
  initialEdges: AppEdge[];
}

export function WorkflowCanvas({ initialNodes, initialEdges }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomAppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  const { onNodeDelete, onNodeUpdate, onConnect } = useWorkflowCore({
    setNodes,
    setEdges,
  });

  const actions = useMemo(
    () => ({
      onNodeDelete,
      onNodeUpdate,
    }),
    [onNodeDelete, onNodeUpdate]
  );

  const nodesWithActions = useMemo(
    () =>
      nodes.map((node) => {
        if (node.data?.actions === actions) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            actions,
          },
        } as CustomAppNode;
      }),
    [nodes, actions]
  );

  const { onDrop, onDragOver } = useCanvasDragDrop(setNodes);

  return (
    <div className="bg-muted/5 relative h-full flex-1">
      <ReactFlow
        nodes={nodesWithActions}
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
  );
}
