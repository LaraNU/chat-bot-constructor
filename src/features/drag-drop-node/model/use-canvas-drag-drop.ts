'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { useReactFlow, useStore, type XYPosition } from '@xyflow/react';

import type { CustomAppNode, WorkflowNodeType } from '@/entities/workflow';

import type {
  MessageNodeData,
  QuestionNodeData,
  ChoiceNodeData,
  StartNodeData,
  ConditionNodeData,
  SummaryNodeData,
  EndNodeData,
} from '@/entities/workflow/model/types';

function getDefaultNodeData(type: WorkflowNodeType): Record<string, unknown> {
  switch (type) {
    case 'message': {
      const data: MessageNodeData = {
        text: '',
        attachmentIds: [],
      };

      return data;
    }

    case 'question': {
      const data: QuestionNodeData = {
        text: '',
        answerLabel: '',
      };

      return data;
    }

    case 'choice': {
      const data: ChoiceNodeData = {
        text: '',
        buttons: [],
      };

      return data;
    }

    case 'start': {
      const data: StartNodeData = {};

      return data;
    }

    case 'condition': {
      const data: ConditionNodeData = {
        questionNodeId: '',
        operator: 'equals',
        value: '',
      };

      return data;
    }

    case 'summary': {
      const data: SummaryNodeData = {
        introText: '',
        includedQuestionIds: [],
        customTemplate: '',
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
  const { screenToFlowPosition, getViewport } = useReactFlow();
  const paneWidth = useStore((state) => state.width);
  const paneHeight = useStore((state) => state.height);

  const createNodeAtPosition = useCallback(
    (type: WorkflowNodeType, position: XYPosition) => {
      const newNode: CustomAppNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: getDefaultNodeData(type),
      } as CustomAppNode;

      setNodes((nodes) => [...nodes, newNode]);
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      createNodeAtPosition(type, position);
    },
    [screenToFlowPosition, createNodeAtPosition]
  );

  const onTapAdd = useCallback(
    (type: WorkflowNodeType) => {
      const { x, y, zoom } = getViewport();

      createNodeAtPosition(type, {
        x: (paneWidth / 2 - x) / zoom,
        y: (paneHeight / 2 - y) / zoom,
      });
    },
    [getViewport, paneWidth, paneHeight, createNodeAtPosition]
  );

  return {
    onDragOver,
    onDrop,
    onTapAdd,
  };
}
