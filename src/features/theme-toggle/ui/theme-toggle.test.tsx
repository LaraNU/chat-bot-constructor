import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './theme-toggle';
import { vi, Mock } from 'vitest';
import { useTheme } from 'next-themes';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

test('ThemeToggle switches theme on click', () => {
  const setTheme = vi.fn();
  (useTheme as Mock).mockReturnValue({ theme: 'light', setTheme });

  render(<ThemeToggle />);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(setTheme).toHaveBeenCalledWith('dark');
});
