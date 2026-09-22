'use client';

import { useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { useReactFlow, useStore, type XYPosition } from '@xyflow/react';

/**
 * Repeated taps on the same palette entry without panning between them would
 * otherwise all land on the exact same viewport-center position, stacking
 * new nodes perfectly on top of each other (indistinguishable from "nothing
 * was added" until the user drags them apart). Each consecutive tap-add at
 * an unchanged viewport nudges the position by this offset, cascading
 * diagonally; panning (which changes the computed center) resets the count.
 */
const TAP_ADD_CASCADE_OFFSET_PX = 24;

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
  const lastTapAddRef = useRef<{ x: number; y: number; cascadeCount: number } | null>(null);

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

      const baseX = (paneWidth / 2 - x) / zoom;
      const baseY = (paneHeight / 2 - y) / zoom;

      const last = lastTapAddRef.current;
      const isSameViewportAsLastTap = last !== null && last.x === baseX && last.y === baseY;
      const cascadeCount = isSameViewportAsLastTap ? last.cascadeCount + 1 : 0;

      lastTapAddRef.current = { x: baseX, y: baseY, cascadeCount };

      createNodeAtPosition(type, {
        x: baseX + cascadeCount * TAP_ADD_CASCADE_OFFSET_PX,
        y: baseY + cascadeCount * TAP_ADD_CASCADE_OFFSET_PX,
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
