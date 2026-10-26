import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SegmentedControl } from './segmented-control';

function BillingPeriod(props: Partial<React.ComponentProps<typeof SegmentedControl.Root>>) {
  return (
    <SegmentedControl.Root
      aria-label='Billing period'
      {...props}
    >
      <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
      <SegmentedControl.Item value='annual'>Annual</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}

describe('Mosaic SegmentedControl', () => {
  it('renders a radio group with styled parts', () => {
    render(<BillingPeriod defaultValue='monthly' />);

    expect(screen.getByRole('radiogroup', { name: 'Billing period' })).toHaveClass('cl-segmented-control-root');
    const monthly = screen.getByRole('radio', { name: 'Monthly' });
    expect(monthly).toHaveClass('cl-segmented-control-item');
    expect(monthly).toHaveAttribute('aria-checked', 'true');
    expect(monthly).toHaveAttribute('data-selected');
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects an item on click', async () => {
    const onValueChange = vi.fn();
    render(
      <BillingPeriod
        defaultValue='monthly'
        onValueChange={onValueChange}
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Annual' }));

    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('aria-checked', 'true');
    expect(onValueChange).toHaveBeenCalledWith('annual');
  });

  it('tabs onto the selected item and moves the selection with arrow keys', async () => {
    render(<BillingPeriod defaultValue='annual' />);

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    const monthly = screen.getByRole('radio', { name: 'Monthly' });
    expect(monthly).toHaveFocus();
    expect(monthly).toHaveAttribute('aria-checked', 'true');
  });

  it('flips the arrow keys in a right-to-left layout', async () => {
    render(
      <div dir='rtl'>
        <BillingPeriod defaultValue='monthly' />
      </div>,
    );

    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('aria-checked', 'true');
  });

  it('does not select an item that is focused without keyboard navigation', () => {
    const onValueChange = vi.fn();
    render(
      <BillingPeriod
        value='monthly'
        onValueChange={onValueChange}
      />,
    );

    screen.getByRole('radio', { name: 'Annual' }).focus();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps a disabled item focusable and skips it with the arrow keys', async () => {
    render(
      <SegmentedControl.Root
        aria-label='Billing period'
        defaultValue='monthly'
      >
        <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
        <SegmentedControl.Item
          value='annual'
          disabled
        >
          Annual
        </SegmentedControl.Item>
        <SegmentedControl.Item value='lifetime'>Lifetime</SegmentedControl.Item>
      </SegmentedControl.Root>,
    );

    expect(screen.getByRole('radio', { name: 'Annual' })).not.toHaveAttribute('disabled');
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('aria-disabled', 'true');

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'Lifetime' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Lifetime' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves to and selects the first and last enabled items with Home and End', async () => {
    render(
      <SegmentedControl.Root
        aria-label='Billing period'
        defaultValue='monthly'
      >
        <SegmentedControl.Item
          value='free'
          disabled
        >
          Free
        </SegmentedControl.Item>
        <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
        <SegmentedControl.Item value='annual'>Annual</SegmentedControl.Item>
        <SegmentedControl.Item
          value='lifetime'
          disabled
        >
          Lifetime
        </SegmentedControl.Item>
      </SegmentedControl.Root>,
    );

    await userEvent.tab();
    await userEvent.keyboard('{End}');

    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{Home}');

    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps moving focus with the arrow keys when a controlled parent ignores onValueChange', async () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl.Root
        aria-label='Billing period'
        value='monthly'
        onValueChange={onValueChange}
      >
        <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
        <SegmentedControl.Item value='annual'>Annual</SegmentedControl.Item>
        <SegmentedControl.Item value='lifetime'>Lifetime</SegmentedControl.Item>
      </SegmentedControl.Root>,
    );

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'Lifetime' })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('lifetime');
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
  });

  it('does not select a disabled item', async () => {
    render(
      <SegmentedControl.Root
        aria-label='Billing period'
        defaultValue='monthly'
      >
        <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
        <SegmentedControl.Item
          value='annual'
          disabled
        >
          Annual
        </SegmentedControl.Item>
      </SegmentedControl.Root>,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Annual' }));

    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute('data-disabled');
  });

  it('marks the indicator with the direction the selection traveled', async () => {
    const { container } = render(<BillingPeriod defaultValue='monthly' />);
    const indicator = container.querySelector('.cl-segmented-control-indicator');

    expect(indicator).toHaveAttribute('aria-hidden', 'true');

    await userEvent.click(screen.getByRole('radio', { name: 'Annual' }));
    expect(indicator).toHaveAttribute('data-direction', 'forward');

    await userEvent.click(screen.getByRole('radio', { name: 'Monthly' }));
    expect(indicator).toHaveAttribute('data-direction', 'backward');
  });

  it('marks the direction when a controlled value changes', () => {
    const { container, rerender } = render(<BillingPeriod value='annual' />);
    rerender(<BillingPeriod value='monthly' />);

    expect(container.querySelector('.cl-segmented-control-indicator')).toHaveAttribute('data-direction', 'backward');
  });

  it('marks the direction when a controlled parent follows onValueChange', async () => {
    function Controlled() {
      const [value, setValue] = React.useState('annual');
      return (
        <BillingPeriod
          value={value}
          onValueChange={setValue}
        />
      );
    }
    const { container } = render(<Controlled />);

    await userEvent.click(screen.getByRole('radio', { name: 'Monthly' }));

    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('.cl-segmented-control-indicator')).toHaveAttribute('data-direction', 'backward');
  });

  it('emits data-selected ahead of the roving tabindex', () => {
    render(<BillingPeriod defaultValue='monthly' />);
    const names = Array.from(screen.getByRole('radio', { name: 'Monthly' }).attributes).map(a => a.name);

    expect(names.indexOf('data-selected')).toBeGreaterThanOrEqual(0);
    expect(names.indexOf('data-selected')).toBeLessThan(names.indexOf('tabindex'));
  });
});
