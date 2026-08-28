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

const mockSignUp = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockReturnValue({
    auth: { signUp: mockSignUp },
  } as unknown as ReturnType<typeof createClient>);
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  } as unknown as ReturnType<typeof useRouter>);
});

describe('useSignUp', () => {
  test('successful sign-up shows toast and navigates to /', async () => {
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
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('failed sign-up shows error toast and does not navigate', async () => {
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
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test('loading state is released on error', async () => {
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

  test('loading state is released when navigation throws after successful sign-up', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    mockPush.mockImplementation(() => {
      throw new Error('Navigation failed');
    });

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
    expect(result.current.isLoading).toBe(false);
  });
});
