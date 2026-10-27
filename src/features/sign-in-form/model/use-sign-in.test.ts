import { vi, describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSignIn } from './use-sign-in';

vi.mock('@/shared/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  })),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

const mockSignIn = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockReturnValue({
    auth: { signInWithPassword: mockSignIn },
  } as unknown as ReturnType<typeof createClient>);
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  } as unknown as ReturnType<typeof useRouter>);
});

describe('useSignIn', () => {
  test('successful sign-in shows toast and navigates to /', async () => {
    mockSignIn.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(toast.success).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('failed sign-in shows error toast and does not navigate', async () => {
    const { AuthError } = await import('@supabase/supabase-js');
    const error = new AuthError('Invalid credentials', 400, 'invalid_credentials');
    mockSignIn.mockResolvedValue({ error });

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('errors.invalid_credentials'),
      expect.any(Object)
    );
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('loading state is released on error', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.isLoading).toBe(false);
  });

  test('loading state is released when navigation throws after successful sign-in', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    mockPush.mockImplementation(() => {
      throw new Error('Navigation failed');
    });

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(toast.success).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
