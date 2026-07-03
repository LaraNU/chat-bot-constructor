import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useControlledField } from './use-controlled-field';

describe('useControlledField', () => {
  it('commits updated value on blur', () => {
    const onCommit = vi.fn();

    const { result } = renderHook(() =>
      useControlledField({
        value: 'hello',
        onCommit,
      })
    );

    act(() => {
      result.current.onChange('hello world');
    });

    expect(result.current.value).toBe('hello world');

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).toHaveBeenCalledOnce();
    expect(onCommit).toHaveBeenCalledWith('hello world');
  });

  it('trims value on commit by default', () => {
    const onCommit = vi.fn();

    const { result } = renderHook(() =>
      useControlledField({
        value: 'hello',
        onCommit,
      })
    );

    act(() => {
      result.current.onChange('  trimmed  ');
    });

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).toHaveBeenCalledOnce();
    expect(onCommit).toHaveBeenCalledWith('trimmed');
  });

  it('does not trim when trim is false', () => {
    const onCommit = vi.fn();

    const { result } = renderHook(() =>
      useControlledField({
        value: 'hello',
        onCommit,
        trim: false,
      })
    );

    act(() => {
      result.current.onChange('  spaced  ');
    });

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).toHaveBeenCalledOnce();
    expect(onCommit).toHaveBeenCalledWith('  spaced  ');
  });

  it('rejects empty values when allowEmpty is false', () => {
    const onCommit = vi.fn();

    const { result } = renderHook(() =>
      useControlledField({
        value: 'hello',
        onCommit,
        allowEmpty: false,
      })
    );

    act(() => {
      result.current.onChange('');
    });

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.value).toBe('hello');
  });

  it('allows empty values when allowEmpty is true', () => {
    const onCommit = vi.fn();

    const { result } = renderHook(() =>
      useControlledField({
        value: 'hello',
        onCommit,
        allowEmpty: true,
      })
    );

    act(() => {
      result.current.onChange('');
    });

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).toHaveBeenCalledOnce();
    expect(onCommit).toHaveBeenCalledWith('');
  });

  it('does not commit when value is unchanged', () => {
    const onCommit = vi.fn();

    const { result } = renderHook(() =>
      useControlledField({
        value: 'hello',
        onCommit,
      })
    );

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).not.toHaveBeenCalled();

    act(() => {
      result.current.onChange('hello');
    });

    act(() => {
      result.current.onBlur();
    });

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('syncs displayed value from external updates when not editing', () => {
    const onCommit = vi.fn();

    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControlledField({
          value,
          onCommit,
        }),
      {
        initialProps: { value: 'hello' },
      }
    );

    expect(result.current.value).toBe('hello');

    rerender({ value: 'updated externally' });

    expect(result.current.value).toBe('updated externally');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not overwrite in-progress draft when external value changes while editing', () => {
    const onCommit = vi.fn();

    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControlledField({
          value,
          onCommit,
        }),
      {
        initialProps: { value: 'hello' },
      }
    );

    act(() => {
      result.current.onChange('draft value');
    });

    rerender({ value: 'updated externally' });

    expect(result.current.value).toBe('draft value');
  });
});
