import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ActionBar } from './action-bar';

const testStyles = stylex.create({
  positioner: {
    bottom: '20px',
  },
});

describe('Mosaic ActionBar', () => {
  it('renders a toolbar with its count and reflects data-open', () => {
    render(
      <ActionBar.Root
        open
        aria-label='Bulk actions'
      >
        <ActionBar.Count>3 selected</ActionBar.Count>
      </ActionBar.Root>,
    );
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(bar).toHaveClass('cl-action-bar');
    expect(bar).toHaveAttribute('data-open', 'true');
    const count = screen.getByText('3 selected');
    expect(count).toHaveClass('cl-action-bar-count');
    expect(count.querySelector('.cl-icon')).not.toBeInTheDocument();
  });

  it('marks the bar inert while closed', () => {
    render(
      <ActionBar.Root
        open={false}
        aria-label='Bulk actions'
      >
        <ActionBar.Count>0 selected</ActionBar.Count>
      </ActionBar.Root>,
    );
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions', hidden: true });
    expect(bar).toHaveAttribute('data-open', 'false');
    expect(bar.inert).toBe(true);
  });

  it('styles the positioner independently from the bar', () => {
    render(
      <ActionBar.Root
        open
        aria-label='Bulk actions'
        positionerXstyle={testStyles.positioner}
      />,
    );
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' }).parentElement).toHaveClass(
      ...(stylex.props(testStyles.positioner).className as string).split(' '),
    );
  });

  it('dismisses with a labelled button', async () => {
    const onDismiss = vi.fn();
    render(
      <ActionBar.Root
        open
        aria-label='Bulk actions'
      >
        <ActionBar.Dismiss onClick={onDismiss} />
      </ActionBar.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
