'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  NodeTypes,
  OnConnect,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/shared/ui/button';
import { WorkflowNodeType } from '@/entities/workflow';
import { StartNode } from '@/entities/workflow/ui/nodes/start-node';
import { MessageNode } from '@/entities/workflow/ui/nodes/message-node';
import { AppEdge, AppNode } from '@/entities/workflow/model/types';

const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
};

interface WorkflowCanvasProps {
  initialNodes?: AppNode[];
  initialEdges?: AppEdge[];
  botId: string;
}

export function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  botId,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AppNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: type === 'message' ? { text: '' } : { triggerType: 'manual' },
      } as AppNode;

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onSave = async () => {
    try {
      const response = await fetch('/api/bots/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, nodes, edges }),
      });
      if (response.ok) alert('Saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

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
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />

        <Panel position="top-right" className="flex gap-2">
          <Button onClick={onSave} size="sm" className="shadow-md">
            Save Changes
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
