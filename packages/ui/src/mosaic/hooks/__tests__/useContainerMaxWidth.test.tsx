import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useContainerMaxWidth } from '../useContainerMaxWidth';

function Probe({ maxWidthRem }: { maxWidthRem: number }) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const narrow = useContainerMaxWidth(node, maxWidthRem);
  return (
    <div
      ref={setNode}
      data-testid='probe'
      data-narrow={narrow}
    />
  );
}

describe('useContainerMaxWidth', () => {
  let resize: ((width: number) => void) | null = null;
  const original = globalThis.ResizeObserver;

  beforeEach(() => {
    resize = null;
    class FakeResizeObserver {
      private readonly callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        resize = width => {
          vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
          this.callback([], this as unknown as ResizeObserver);
        };
      }
      disconnect() {}
      unobserve() {}
    }
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = original;
  });

  it('answers like an inclusive max-width container query, in rem', () => {
    render(<Probe maxWidthRem={48} />);
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-narrow', 'false');

    act(() => resize?.(769));
    expect(probe).toHaveAttribute('data-narrow', 'false');
    act(() => resize?.(768));
    expect(probe).toHaveAttribute('data-narrow', 'true');
    act(() => resize?.(1024));
    expect(probe).toHaveAttribute('data-narrow', 'false');
  });

  it('keeps its last answer while the element has no layout', () => {
    render(<Probe maxWidthRem={48} />);
    const probe = screen.getByTestId('probe');
    act(() => resize?.(400));
    expect(probe).toHaveAttribute('data-narrow', 'true');
    act(() => resize?.(0));
    expect(probe).toHaveAttribute('data-narrow', 'true');
  });
});
