'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { AppNode, WorkflowNodeType } from '@/entities/workflow';

export function useCanvasDragDrop(setNodes: Dispatch<SetStateAction<AppNode[]>>) {
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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

  return {
    onDragOver,
    onDrop,
  };
}
