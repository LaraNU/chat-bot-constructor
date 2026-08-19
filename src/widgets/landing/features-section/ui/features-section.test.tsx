import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useTranslations } from 'next-intl';
import { FeaturesSection } from './features-section';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

describe('FeaturesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslations).mockReturnValue((key: string) => key);
  });

  test('renders six feature cards', () => {
    render(<FeaturesSection />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  });
});
