import { cleanup, render, screen } from '@testing-library/react';
import type {} from '@vitest/browser-playwright';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';

import { Flow } from '..';

afterEach(async () => {
  cleanup();
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

function renderStep({
  state,
  direction,
  animated = false,
  dir,
}: {
  state: 'starting' | 'ending';
  direction: 1 | -1;
  animated?: boolean;
  dir?: 'rtl';
}): HTMLElement {
  render(
    <div dir={dir}>
      <Flow.Root
        value='step'
        state={{}}
      >
        {() => <Flow.Step ids={['step']}>Step</Flow.Step>}
      </Flow.Root>
    </div>,
  );
  const step = screen.getByText('Step');
  step.style.setProperty('--cl-flow-transition-direction', String(direction));
  if (!animated) {
    step.style.transition = 'none';
  }
  step.setAttribute(state === 'starting' ? 'data-starting-style' : 'data-ending-style', '');
  return step;
}

function translateX(step: HTMLElement): number {
  return new DOMMatrix(getComputedStyle(step).transform).m41;
}

function firstSeconds(value: string): number {
  return parseFloat(value.split(',')[0]);
}

describe('Flow step transition', () => {
  it('fades in place, without sliding, in either direction', () => {
    expect(translateX(renderStep({ state: 'starting', direction: 1 }))).toBe(0);
    cleanup();
    expect(translateX(renderStep({ state: 'ending', direction: -1 }))).toBe(0);
    cleanup();
    expect(getComputedStyle(renderStep({ state: 'starting', direction: 1 })).opacity).toBe('0');
  });

  it('lets the outgoing step leave before the incoming one starts', () => {
    const exit = getComputedStyle(renderStep({ state: 'ending', direction: 1, animated: true }));
    const exitDuration = firstSeconds(exit.transitionDuration);
    const exitDelay = firstSeconds(exit.transitionDelay);
    cleanup();
    const enter = getComputedStyle(renderStep({ state: 'starting', direction: 1, animated: true }));

    expect(exitDuration).toBeGreaterThan(0);
    expect(exitDelay).toBe(0);
    expect(firstSeconds(enter.transitionDelay)).toBeGreaterThanOrEqual(exitDuration);
  });

  it('keeps the step in place with reduced motion', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    expect(translateX(renderStep({ state: 'starting', direction: 1 }))).toBe(0);
  });
});
