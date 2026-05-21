'use client';

import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Panel,
  addEdge,
  OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';

import { NODE_TYPES } from './node-types';
import type { AppEdge, AppNode } from '@/entities/workflow';

import { SaveWorkflowButton } from '@/features/save-workflow';
import { useCanvasDragDrop } from '@/features/drag-drop-node';

interface WorkflowCanvasProps {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  botId: string;
}

export function WorkflowCanvas({ initialNodes, initialEdges, botId }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  const { onDrop, onDragOver } = useCanvasDragDrop(setNodes);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
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
        <Panel position="top-right" className="flex gap-2">
          <SaveWorkflowButton botId={botId} nodes={nodes} edges={edges} />
        </Panel>
      </ReactFlow>
    </div>
  );
}
