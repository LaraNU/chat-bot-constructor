'use client';

import { memo } from 'react';

import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

import { X } from 'lucide-react';

type CustomEdgeProps = EdgeProps & {
  onDelete?: (id: string) => void;
};

export const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    markerEnd,
    onDelete,
  }: CustomEdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const edgeColor = selected ? '#2284c5' : '#94a3b8';

    return (
      <>
        <BaseEdge
          path={edgePath}
          id={id}
          markerEnd={markerEnd}
          style={{
            stroke: edgeColor,
            strokeWidth: 2,
            transition: 'all 150ms ease',
          }}
        />

        {selected && (
          <EdgeLabelRenderer>
            <div
              className="nodrag nopan absolute origin-center"
              style={{
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
            >
              <button
                className="cursor-pointer rounded-[50%] border-[5px] border-solid border-[#ffffff] bg-[#f2f2f2] p-[3px]"
                onClick={() => onDelete?.(id)}
              >
                <X size={12} color="#2284c5" absoluteStrokeWidth />
              </button>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

CustomEdge.displayName = 'CustomEdge';
