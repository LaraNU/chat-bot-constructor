import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './use-media-query';

function createMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches;
  let changeListener: ((event: MediaQueryListEvent) => void) | null = null;

  const mediaQueryList = {
    get matches() {
      return matches;
    },
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        changeListener = listener;
      }
    }),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList;

  return {
    mediaQueryList,
    matchMedia: vi.fn().mockReturnValue(mediaQueryList),
    simulateChange: (nextMatches: boolean) => {
      matches = nextMatches;
      changeListener?.({ matches: nextMatches } as MediaQueryListEvent);
    },
  };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the current match state after mount', () => {
    const { matchMedia } = createMatchMediaMock(true);
    vi.stubGlobal('matchMedia', matchMedia);

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    expect(result.current).toBe(true);
  });

  it('updates when the media query match state changes', () => {
    const { matchMedia, simulateChange } = createMatchMediaMock(false);
    vi.stubGlobal('matchMedia', matchMedia);

    const { result } = renderHook(() => useMediaQuery('(pointer: coarse)'));

    expect(result.current).toBe(false);

    act(() => {
      simulateChange(true);
    });

    expect(result.current).toBe(true);
  });

  it('unsubscribes from the previous query when the query string changes', () => {
    const { mediaQueryList, matchMedia } = createMatchMediaMock(false);
    vi.stubGlobal('matchMedia', matchMedia);

    const { rerender } = renderHook(({ query }: { query: string }) => useMediaQuery(query), {
      initialProps: { query: '(max-width: 767px)' },
    });

    rerender({ query: '(pointer: coarse)' });

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(matchMedia).toHaveBeenCalledWith('(pointer: coarse)');
  });
});
