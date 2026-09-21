import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './sheet';

function renderSheet(side: 'left' | 'right' = 'left') {
  const onOpenChange = vi.fn();

  render(
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={side}>
        <SheetTitle>Sheet title</SheetTitle>
        <p>Sheet body</p>
      </SheetContent>
    </Sheet>
  );

  return { onOpenChange };
}

describe('Sheet', () => {
  it('opens on trigger click and shows its content', () => {
    renderSheet();

    expect(screen.queryByText('Sheet body')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByText('Sheet body')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { onOpenChange } = renderSheet();

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Sheet body')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByText('Sheet body'), { key: 'Escape', code: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // Radix's outside-click dismissal relies on native pointer-capture semantics
  // that jsdom's fireEvent doesn't fully reproduce; it's exercised manually in
  // the browser instead (same as the existing Dialog primitive it mirrors).

  it('renders the close button by default', () => {
    renderSheet();

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
