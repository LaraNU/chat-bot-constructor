'use client';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [{ id: '1', position: { x: 100, y: 100 }, data: { label: 'Начало чата' } }];
const initialEdges: [] | undefined = [];

export function WorkflowCanvas() {
  return (
    <div className="bg-card h-full w-full rounded-xl border shadow-inner">
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
