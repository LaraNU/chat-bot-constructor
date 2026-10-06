import { vi, describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSignUp } from './use-sign-up';

vi.mock('@/shared/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
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

const mockSignUp = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockReturnValue({
    auth: { signUp: mockSignUp },
  } as unknown as ReturnType<typeof createClient>);
});

describe('useSignUp', () => {
  test('successful sign-up shows a toast and leaves isLoading true (navigation is driven by the auth state listener + middleware, not this hook)', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.form.setValue('name', 'Test User');
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

  test('failed sign-up shows error toast and releases isLoading', async () => {
    const { AuthError } = await import('@supabase/supabase-js');
    const error = new AuthError('User already exists', 400, 'user_already_exists');
    mockSignUp.mockResolvedValue({ error });

    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.form.setValue('name', 'Test User');
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('errors.user_already_exists'),
      expect.any(Object)
    );
    expect(result.current.isLoading).toBe(false);
  });

  test('loading state is released on unexpected error', async () => {
    mockSignUp.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.form.setValue('name', 'Test User');
      result.current.form.setValue('email', 'test@example.com');
      result.current.form.setValue('password', 'password123');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
