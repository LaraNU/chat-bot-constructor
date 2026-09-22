import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CustomAppNode } from '@/entities/workflow';

const mockScreenToFlowPosition = vi.fn((position: { x: number; y: number }) => position);
const mockGetViewport = vi.fn(() => ({ x: 0, y: 0, zoom: 1 }));

vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    screenToFlowPosition: mockScreenToFlowPosition,
    getViewport: mockGetViewport,
  }),
  useStore: (selector: (state: { width: number; height: number }) => unknown) =>
    selector({ width: 800, height: 600 }),
}));

import { useCanvasDragDrop } from './use-canvas-drag-drop';

function createDragEvent(dataTransferData: Record<string, string>) {
  return {
    preventDefault: vi.fn(),
    clientX: 120,
    clientY: 240,
    dataTransfer: {
      getData: (key: string) => dataTransferData[key] ?? '',
      dropEffect: '',
    },
  } as unknown as React.DragEvent;
}

function trackSetNodes() {
  let nodes: CustomAppNode[] = [];
  const setNodes = vi.fn(
    (updater: CustomAppNode[] | ((nodes: CustomAppNode[]) => CustomAppNode[])) => {
      nodes = typeof updater === 'function' ? updater(nodes) : updater;
    }
  );

  return { setNodes, getNodes: () => nodes };
}

describe('useCanvasDragDrop', () => {
  beforeEach(() => {
    mockScreenToFlowPosition.mockClear();
    mockGetViewport.mockReturnValue({ x: 0, y: 0, zoom: 1 });
  });

  it('creates a node at the drop position via onDrop (existing drag-and-drop path unchanged)', () => {
    const { setNodes, getNodes } = trackSetNodes();
    const { result } = renderHook(() => useCanvasDragDrop(setNodes));

    act(() => {
      result.current.onDrop(createDragEvent({ 'application/reactflow': 'message' }));
    });

    expect(getNodes()).toHaveLength(1);
    expect(getNodes()[0].type).toBe('message');
    expect(getNodes()[0].position).toEqual({ x: 120, y: 240 });
  });

  it('does nothing on drop when no node type is present in the drag data', () => {
    const { setNodes, getNodes } = trackSetNodes();
    const { result } = renderHook(() => useCanvasDragDrop(setNodes));

    act(() => {
      result.current.onDrop(createDragEvent({}));
    });

    expect(setNodes).not.toHaveBeenCalled();
    expect(getNodes()).toHaveLength(0);
  });

  it('adds exactly one node with default data via onTapAdd, centered in the current viewport', () => {
    const { setNodes, getNodes } = trackSetNodes();
    mockGetViewport.mockReturnValue({ x: 100, y: 50, zoom: 2 });

    const { result } = renderHook(() => useCanvasDragDrop(setNodes));

    act(() => {
      result.current.onTapAdd('message');
    });

    expect(getNodes()).toHaveLength(1);
    expect(getNodes()[0].type).toBe('message');
    expect(getNodes()[0].data).toEqual({ text: '', attachmentIds: [] });
    // pane 800x600, viewport x=100 y=50 zoom=2 -> center = ((800/2 - 100)/2, (600/2 - 50)/2)
    expect(getNodes()[0].position).toEqual({ x: 150, y: 125 });
  });

  it('cascades consecutive onTapAdd calls at an unchanged viewport so nodes do not stack exactly on top of each other', () => {
    const { setNodes, getNodes } = trackSetNodes();
    const { result } = renderHook(() => useCanvasDragDrop(setNodes));

    act(() => {
      result.current.onTapAdd('message');
      result.current.onTapAdd('message');
      result.current.onTapAdd('message');
    });

    expect(getNodes()).toHaveLength(3);
    // viewport unchanged (x=0,y=0,zoom=1) -> base center (400, 300), each repeat offset by 24px
    expect(getNodes()[0].position).toEqual({ x: 400, y: 300 });
    expect(getNodes()[1].position).toEqual({ x: 424, y: 324 });
    expect(getNodes()[2].position).toEqual({ x: 448, y: 348 });
  });

  it('resets the cascade once the viewport changes (e.g. the user panned) between taps', () => {
    const { setNodes, getNodes } = trackSetNodes();
    const { result } = renderHook(() => useCanvasDragDrop(setNodes));

    act(() => {
      result.current.onTapAdd('message');
    });

    mockGetViewport.mockReturnValue({ x: 100, y: 0, zoom: 1 });

    act(() => {
      result.current.onTapAdd('message');
    });

    expect(getNodes()).toHaveLength(2);
    expect(getNodes()[0].position).toEqual({ x: 400, y: 300 });
    // new viewport center, not offset by the previous cascade
    expect(getNodes()[1].position).toEqual({ x: 300, y: 300 });
  });
});
