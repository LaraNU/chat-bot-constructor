import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PropertiesPanel } from './properties-panel';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/entities/workflow/model/store/selectors', () => ({
  useSelectedNode: () => null,
}));

// `NodePropertiesRouter` transitively imports the `entities/workflow` barrel,
// which also re-exports server-only code (`workflowService`) not resolvable
// in this jsdom test environment; it's never rendered here since
// `useSelectedNode` returns null, so the module is stubbed out entirely.
vi.mock('./node-properties-router', () => ({
  NodePropertiesRouter: () => null,
}));

describe('PropertiesPanel', () => {
  it('renders as a non-modal sheet on mobile: no full-screen overlay blocking the canvas underneath', () => {
    render(<PropertiesPanel isMobile open onOpenChange={vi.fn()} />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-overlay"]')).not.toBeInTheDocument();
  });

  it('renders nothing visible when closed on mobile', () => {
    render(<PropertiesPanel isMobile open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByText('title')).not.toBeInTheDocument();
  });

  it('renders the fixed desktop panel, unaffected, when not mobile', () => {
    render(<PropertiesPanel isMobile={false} open={false} onOpenChange={vi.fn()} />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-content"]')).not.toBeInTheDocument();
  });
});
