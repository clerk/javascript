import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Stepper } from './stepper';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

function stepper(container: HTMLElement) {
  const element = container.querySelector('.cl-stepper');
  if (!(element instanceof HTMLElement)) {
    throw new Error('Stepper did not render');
  }
  return element;
}

function progressText(container: HTMLElement) {
  return container.querySelector('.cl-stepper-text')?.textContent;
}

function segmentStates(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.cl-stepper-segment')).map(segment =>
    segment.getAttribute('data-state'),
  );
}

describe('Mosaic Stepper', () => {
  it('shows the current step out of the total', () => {
    const { container } = render(
      <Stepper
        value={2}
        max={3}
      />,
    );
    expect(progressText(container)).toBe('Step 2 of 3');
    expect(screen.getByText('Step')).toHaveClass('cl-stepper-label');
    expect(screen.getByText('2 of 3')).toHaveClass('cl-stepper-count');
    expect(stepper(container)).toHaveAttribute('data-value', '2');
    expect(stepper(container)).toHaveAttribute('data-max', '3');
  });

  it('marks earlier steps complete, the current step current and later steps upcoming', () => {
    const { container } = render(
      <Stepper
        value={2}
        max={4}
      />,
    );
    expect(segmentStates(container)).toEqual(['complete', 'current', 'upcoming', 'upcoming']);
  });

  it('keeps the step inside the range', () => {
    const { container, rerender } = render(
      <Stepper
        value={9}
        max={3}
      />,
    );
    expect(progressText(container)).toBe('Step 3 of 3');

    rerender(
      <Stepper
        value={0}
        max={3}
      />,
    );
    expect(progressText(container)).toBe('Step 1 of 3');

    rerender(
      <Stepper
        value={2.7}
        max={0}
      />,
    );
    expect(progressText(container)).toBe('Step 1 of 1');
    expect(segmentStates(container)).toEqual(['current']);
  });

  it('renders the segments as decorative when the steps cannot be changed', () => {
    const { container } = render(
      <Stepper
        value={1}
        max={3}
      />,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(container.querySelector('.cl-stepper-segments')).toHaveAttribute('aria-hidden', 'true');
  });

  it('moves to the step whose segment is clicked', async () => {
    const onValueChange = vi.fn();
    render(
      <Stepper
        value={2}
        max={3}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Step 1' }));
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Step 3' }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it('marks the current step button as the current step', () => {
    render(
      <Stepper
        value={2}
        max={3}
        onValueChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Step 2' })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: 'Step 1' })).not.toHaveAttribute('aria-current');
  });

  it('reaches every step from the keyboard', async () => {
    const onValueChange = vi.fn();
    render(
      <Stepper
        value={1}
        max={3}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Step 3' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it('uses custom labels', () => {
    const { container } = render(
      <Stepper
        value={1}
        max={2}
        label='Étape'
        countLabel='{step} sur {total}'
        stepLabel='Aller à l’étape {step}'
        onValueChange={vi.fn()}
      />,
    );
    expect(progressText(container)).toBe('Étape 1 sur 2');
    expect(screen.getByRole('button', { name: 'Aller à l’étape 2' })).toBeInTheDocument();
  });

  it('merges xstyle atoms after the slot atoms and forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Stepper
        ref={ref}
        value={1}
        max={3}
        xstyle={atoms.spaced}
      />,
    );
    expect(ref.current).toBe(stepper(container));
    expect(stepper(container)).toHaveClass('cl-stepper', stylex.props(atoms.spaced).className ?? '');
  });
});
