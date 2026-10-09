import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Flow } from './flow';

function TestFlow({ value }: { value: string }) {
  return (
    <Flow.Root
      value={value}
      state={null}
      data-testid='root'
    >
      {() => (
        <>
          <Flow.Step
            ids={['short']}
            data-testid='short-step'
          >
            <div style={{ height: 100 }} />
          </Flow.Step>
          <Flow.Step
            ids={['tall']}
            data-testid='tall-step'
          >
            <div style={{ height: 200 }} />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}

function withMotion({ height, step }: { height: number; step: number }) {
  const style = document.createElement('style');
  style.textContent = `
    html body [data-testid='root'] {
      transition-duration: ${height}ms !important;
      transition-delay: 0s !important;
    }
    html body [data-testid='root'] > * {
      transition-duration: ${step}ms !important;
      transition-delay: 0s !important;
    }
  `;
  document.head.append(style);
  return () => style.remove();
}

function recordHeightTransitions(root: HTMLElement) {
  const events: string[] = [];
  const record = (event: TransitionEvent) => {
    if (event.target === root && event.propertyName === 'height') {
      events.push(event.type);
    }
  };
  root.addEventListener('transitionend', record);
  root.addEventListener('transitioncancel', record);
  return events;
}

async function renderSettled() {
  const view = render(<TestFlow value='short' />);
  const root = screen.getByTestId('root');
  await waitFor(() => expect(root).not.toHaveAttribute('data-initial'));
  return { ...view, root };
}

describe('Flow motion', () => {
  let restoreMotion = () => {};

  afterEach(() => restoreMotion());

  it.each([
    { name: 'the step exit is shorter than the height change', height: 250, step: 100 },
    { name: 'the step exit is longer than the height change', height: 100, step: 250 },
  ])('animates the height to its end when $name', async ({ height, step }) => {
    restoreMotion = withMotion({ height, step });
    const { root, rerender } = await renderSettled();
    const events = recordHeightTransitions(root);

    rerender(<TestFlow value='tall' />);

    expect(root).toHaveAttribute('data-transitioning');
    await waitFor(() => expect(root).not.toHaveAttribute('data-transitioning'));
    await waitFor(() => expect(screen.queryByTestId('short-step')).toBeNull());
    await waitFor(() => expect(events).toEqual(['transitionend']));
    expect(root.getBoundingClientRect().height).toBe(200);
  });
});
