import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MessageNodeData } from '../types';

import { useDeleteNode, useUpdateNode } from './actions';
import { useNodeMutations } from './use-node-mutations';

vi.mock('./actions', () => ({
  useUpdateNode: vi.fn(),
  useDeleteNode: vi.fn(),
}));

describe('useNodeMutations', () => {
  it('calls deleteNode with the bound node id', () => {
    const deleteNode = vi.fn();

    vi.mocked(useDeleteNode).mockReturnValue(deleteNode);
    vi.mocked(useUpdateNode).mockReturnValue(vi.fn());

    const { result } = renderHook(() => useNodeMutations<MessageNodeData>('node-1'));

    act(() => {
      result.current.remove();
    });

    expect(deleteNode).toHaveBeenCalledOnce();
    expect(deleteNode).toHaveBeenCalledWith('node-1');
  });

  it('patches node data via patch', () => {
    const updateNode = vi.fn();

    vi.mocked(useUpdateNode).mockReturnValue(updateNode);
    vi.mocked(useDeleteNode).mockReturnValue(vi.fn());

    const { result } = renderHook(() => useNodeMutations<MessageNodeData>('node-1'));

    act(() => {
      result.current.patch({ text: 'Updated text' });
    });

    expect(updateNode).toHaveBeenCalledOnce();
    expect(updateNode).toHaveBeenCalledWith('node-1', { text: 'Updated text' });
  });

  it('commits a single field via commit', () => {
    const updateNode = vi.fn();

    vi.mocked(useUpdateNode).mockReturnValue(updateNode);
    vi.mocked(useDeleteNode).mockReturnValue(vi.fn());

    const { result } = renderHook(() => useNodeMutations<MessageNodeData>('node-1'));

    act(() => {
      result.current.commit('text')('Committed text');
    });

    expect(updateNode).toHaveBeenCalledOnce();
    expect(updateNode).toHaveBeenCalledWith('node-1', { text: 'Committed text' });
  });
});
