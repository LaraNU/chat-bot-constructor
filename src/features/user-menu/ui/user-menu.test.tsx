import { vi, describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import { UserMenu } from './user-menu';

vi.mock('@/shared/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: vi.fn(),
    },
  })),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

const mockSignOut = vi.fn();
const mockRefresh = vi.fn();

const user = { email: 'test@example.com', user_metadata: {} } as unknown as User;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockReturnValue({
    auth: { signOut: mockSignOut },
  } as unknown as ReturnType<typeof createClient>);
  vi.mocked(useRouter).mockReturnValue({
    refresh: mockRefresh,
  } as unknown as ReturnType<typeof useRouter>);
});

describe('UserMenu', () => {
  test('shows a spinner and disables the button while signing out, then refreshes', async () => {
    let resolveSignOut: (value: { error: null }) => void;
    mockSignOut.mockReturnValue(
      new Promise((resolve) => {
        resolveSignOut = resolve;
      })
    );

    render(<UserMenu user={user} />);
    const button = screen.getByTestId('sign-out-button');

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();

    resolveSignOut!({ error: null });

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  test('shows an error toast and re-enables the button when sign-out fails', async () => {
    const { AuthError } = await import('@supabase/supabase-js');
    mockSignOut.mockResolvedValue({ error: new AuthError('Network error', 500) });

    render(<UserMenu user={user} />);
    const button = screen.getByTestId('sign-out-button');

    fireEvent.click(button);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('signOutError', expect.any(Object))
    );

    expect(button).not.toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
