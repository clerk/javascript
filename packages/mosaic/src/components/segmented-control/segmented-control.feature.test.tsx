import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SegmentedControl } from './segmented-control';

function transitionDurations(element: Element) {
  const durations = new Map<string, number>();
  for (const animation of element.getAnimations()) {
    if (animation instanceof CSSTransition) {
      durations.set(animation.transitionProperty, Number(animation.effect?.getComputedTiming().duration));
    }
  }
  return durations;
}

async function settle(element: Element) {
  await Promise.all(element.getAnimations().map(animation => animation.finished));
}

function Sizes(props: Partial<React.ComponentProps<typeof SegmentedControl.Root>>) {
  return (
    <SegmentedControl.Root
      aria-label='Size'
      {...props}
    >
      <SegmentedControl.Item value='small'>Small</SegmentedControl.Item>
      <SegmentedControl.Item value='medium'>Medium</SegmentedControl.Item>
      <SegmentedControl.Item value='large'>Large</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}

function getIndicator(container: Element) {
  const indicator = container.querySelector('.cl-segmented-control-indicator');
  if (!indicator) {
    throw new Error('indicator not rendered');
  }
  return indicator;
}

describe('SegmentedControl indicator motion', () => {
  it('leads with the edge the selection travels toward on arrow keys', async () => {
    const indicator = getIndicator(render(<Sizes defaultValue='small' />).container);

    await userEvent.click(screen.getByRole('radio', { name: 'Small' }));
    await userEvent.keyboard('{ArrowRight}');
    const forward = transitionDurations(indicator);
    await settle(indicator);
    await userEvent.keyboard('{ArrowLeft}');
    const backward = transitionDurations(indicator);

    expect(forward.get('right')).toBeLessThan(forward.get('left') ?? 0);
    expect(backward.get('left')).toBeLessThan(backward.get('right') ?? 0);
  });

  it('leads with the edge the selection travels toward on click', async () => {
    const indicator = getIndicator(render(<Sizes defaultValue='small' />).container);

    await userEvent.click(screen.getByRole('radio', { name: 'Large' }));
    const forward = transitionDurations(indicator);
    await settle(indicator);
    await userEvent.click(screen.getByRole('radio', { name: 'Small' }));
    const backward = transitionDurations(indicator);

    expect(forward.get('right')).toBeLessThan(forward.get('left') ?? 0);
    expect(backward.get('left')).toBeLessThan(backward.get('right') ?? 0);
  });

  it('leads with the edge the selection travels toward on a controlled change', async () => {
    const { container, rerender } = render(<Sizes value='small' />);
    const indicator = getIndicator(container);
    indicator.getBoundingClientRect();

    rerender(<Sizes value='large' />);
    const forward = transitionDurations(indicator);
    await settle(indicator);
    rerender(<Sizes value='small' />);
    const backward = transitionDurations(indicator);

    expect(forward.get('right')).toBeLessThan(forward.get('left') ?? 0);
    expect(backward.get('left')).toBeLessThan(backward.get('right') ?? 0);
  });
});
