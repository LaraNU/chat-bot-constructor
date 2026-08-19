import { render, screen, fireEvent, within } from '@testing-library/react';
import { LangSwitcher } from './language-switcher';
import { vi, Mock } from 'vitest';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

vi.mock('next-intl', () => ({ useLocale: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

function setup(locale = 'en') {
  const replace = vi.fn();
  (useLocale as Mock).mockReturnValue(locale);
  (useRouter as Mock).mockReturnValue({ replace });
  (usePathname as Mock).mockReturnValue('/');
  return replace;
}

test('inline switcher calls router.replace with the selected locale', () => {
  const replace = setup('en');

  render(<LangSwitcher />);

  fireEvent.click(within(screen.getByTestId('lang-switcher-inline')).getByText('RU'));

  expect(replace).toHaveBeenCalledWith('/', { locale: 'ru' });
});

test('renders a compact dropdown trigger for narrow viewports', () => {
  setup('en');

  render(<LangSwitcher />);

  const trigger = screen.getByTestId('lang-switcher-dropdown');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  expect(trigger).toHaveTextContent('EN');
});
