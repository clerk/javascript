import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useMeasure } from '../useMeasure';

function Probe() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-testid='probe'
      data-width={width ?? 'null'}
      data-height={height ?? 'null'}
    />
  );
}

describe('useMeasure', () => {
  let report: ((width: number, height: number) => void) | null = null;
  const original = globalThis.ResizeObserver;

  beforeEach(() => {
    report = null;
    class FakeResizeObserver {
      private readonly callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        report = (width, height) =>
          this.callback(
            [{ target, contentRect: { width, height } } as unknown as ResizeObserverEntry],
            this as unknown as ResizeObserver,
          );
      }
      disconnect() {}
      unobserve() {}
    }
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = original;
  });

  it('is unmeasured until the observer reports, then tracks the content box', () => {
    render(<Probe />);
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-width', 'null');
    expect(probe).toHaveAttribute('data-height', 'null');

    act(() => report?.(400, 300));
    expect(probe).toHaveAttribute('data-width', '400');
    expect(probe).toHaveAttribute('data-height', '300');

    act(() => report?.(1024, 300));
    expect(probe).toHaveAttribute('data-width', '1024');
  });
});
