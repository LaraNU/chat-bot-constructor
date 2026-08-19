import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { useTranslations } from 'next-intl';
import { RoadmapSection } from './roadmap-section';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

describe('RoadmapSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslations as Mock).mockReturnValue((key: string) => {
      const dictionary: Record<string, string> = {
        title: 'Roadmap',
        subtitle: 'Honest product status',
        availableTitle: 'Available now',
        inProgressTitle: 'In progress',
        plannedTitle: 'Planned',
      };
      return dictionary[key] ?? key;
    });
  });

  test('renders available, in progress, and planned groups', () => {
    render(<RoadmapSection />);

    expect(screen.getByRole('heading', { name: 'Available now' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planned' })).toBeInTheDocument();
  });
});
