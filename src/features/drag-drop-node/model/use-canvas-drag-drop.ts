'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { CustomAppNode, WorkflowNodeType } from '@/entities/workflow';
import type {
  MessageNodeData,
  StartNodeData,
  ConditionNodeData,
  EndNodeData,
} from '@/entities/workflow/model/types';

function getDefaultNodeData(type: WorkflowNodeType): Record<string, unknown> {
  switch (type) {
    case 'message': {
      const data: MessageNodeData = {
        text: '',
        shouldSaveResponse: false,
        saveToVariable: '',
        buttons: [],
      };
      return data;
    }
    case 'start': {
      const data: StartNodeData = {
        triggerType: 'manual',
      };
      return data;
    }
    case 'condition': {
      const data: ConditionNodeData = {
        variable: 'message_text',
        operator: 'equals',
        value: '',
      };
      return data;
    }
    case 'end': {
      const data: EndNodeData = {
        message: '',
      };
      return data;
    }
    default:
      return {};
  }
}

export function useCanvasDragDrop(setNodes: Dispatch<SetStateAction<CustomAppNode[]>>) {
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

      const newNode: CustomAppNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: getDefaultNodeData(type),
      } as CustomAppNode;

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  return {
    onDragOver,
    onDrop,
  };
}
