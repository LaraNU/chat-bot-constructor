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
import { toast } from 'sonner';

const mockSignIn = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockReturnValue({
    auth: { signInWithPassword: mockSignIn },
  } as unknown as ReturnType<typeof createClient>);
});

describe('useSignIn', () => {
  test('successful sign-in shows a toast and leaves isLoading true (navigation is driven by the auth state listener + middleware, not this hook)', async () => {
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
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);
  });

  test('failed sign-in shows error toast and releases isLoading', async () => {
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
    expect(result.current.isLoading).toBe(false);
  });

  test('loading state is released on unexpected error', async () => {
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
});
