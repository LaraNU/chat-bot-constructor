import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsDirty, useIsSaving } from '@/entities/workflow/model/store';

import { useSaveWorkflow } from './use-save-workflow';
import { useAutosave } from './use-autosave';

vi.mock('@/entities/workflow/model/store', () => ({
  useIsDirty: vi.fn(),
  useIsSaving: vi.fn(),
}));

vi.mock('./use-save-workflow', () => ({
  useSaveWorkflow: vi.fn(),
}));

function fireFocusIn(target: Element) {
  const event = new FocusEvent('focusin', { bubbles: true, relatedTarget: null });
  Object.defineProperty(event, 'target', { value: target });
  document.dispatchEvent(event);
}

function fireFocusOut(target: Element) {
  const event = new FocusEvent('focusout', { bubbles: true, relatedTarget: null });
  Object.defineProperty(event, 'target', { value: target });
  document.dispatchEvent(event);
}

describe('useAutosave', () => {
  const mockSave = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useSaveWorkflow).mockReturnValue({ save: mockSave });
    vi.mocked(useIsDirty).mockReturnValue(false);
    vi.mocked(useIsSaving).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('does not save when isDirty is false', () => {
    vi.mocked(useIsDirty).mockReturnValue(false);
    renderHook(() => useAutosave({ botId: 'bot-1' }));
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves after 2 seconds when isDirty is true', () => {
    vi.mocked(useIsDirty).mockReturnValue(true);
    renderHook(() => useAutosave({ botId: 'bot-1' }));
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(mockSave).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mockSave).toHaveBeenCalledOnce();
  });

  it('does not save while isSaving is true', () => {
    vi.mocked(useIsDirty).mockReturnValue(true);
    vi.mocked(useIsSaving).mockReturnValue(true);
    renderHook(() => useAutosave({ botId: 'bot-1' }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('resets timer when isDirty flips from false to true again before 2s', () => {
    vi.mocked(useIsDirty).mockReturnValue(false);
    const { rerender } = renderHook(() => useAutosave({ botId: 'bot-1' }));

    vi.mocked(useIsDirty).mockReturnValue(true);
    rerender();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(mockSave).not.toHaveBeenCalled();

    vi.mocked(useIsDirty).mockReturnValue(false);
    rerender();
    vi.mocked(useIsDirty).mockReturnValue(true);
    rerender();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(mockSave).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mockSave).toHaveBeenCalledOnce();
  });

  it('calls useSaveWorkflow with silent=true', () => {
    vi.mocked(useIsDirty).mockReturnValue(true);
    renderHook(() => useAutosave({ botId: 'bot-1' }));
    expect(useSaveWorkflow).toHaveBeenCalledWith({ botId: 'bot-1', silent: true });
  });

  it('does not save while an input is focused', () => {
    vi.mocked(useIsDirty).mockReturnValue(true);
    renderHook(() => useAutosave({ botId: 'bot-1' }));

    const input = document.createElement('input');
    act(() => {
      fireFocusIn(input);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves after blur from input once 2s have elapsed', () => {
    vi.mocked(useIsDirty).mockReturnValue(true);
    renderHook(() => useAutosave({ botId: 'bot-1' }));

    const input = document.createElement('input');
    act(() => {
      fireFocusIn(input);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockSave).not.toHaveBeenCalled();

    act(() => {
      fireFocusOut(input);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockSave).toHaveBeenCalledOnce();
  });

  it('does not save while a textarea is focused', () => {
    vi.mocked(useIsDirty).mockReturnValue(true);
    renderHook(() => useAutosave({ botId: 'bot-1' }));

    const textarea = document.createElement('textarea');
    act(() => {
      fireFocusIn(textarea);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mockSave).not.toHaveBeenCalled();
  });
});
