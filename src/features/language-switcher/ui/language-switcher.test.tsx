import { render, screen, fireEvent } from '@testing-library/react';
import { LangSwitcher } from './language-switcher';
import { vi, Mock } from 'vitest';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

vi.mock('next-intl', () => ({ useLocale: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

test('LangSwitcher calls router.replace with correct locale', () => {
  const replace = vi.fn();
  (useLocale as Mock).mockReturnValue('en');
  (useRouter as Mock).mockReturnValue({ replace });
  (usePathname as Mock).mockReturnValue('/');

  render(<LangSwitcher />);

  const ruButton = screen.getByText('RU');
  fireEvent.click(ruButton);

  expect(replace).toHaveBeenCalledWith('/', { locale: 'ru' });
});
