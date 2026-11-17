import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePanelSize } from '../use-panel-size';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(Element.prototype, 'getAnimations');
});

function Panel({ open }: { open: boolean }) {
  const { panelRef, mounted, transitionProps, height, width } = usePanelSize(open);

  if (!mounted) {
    return null;
  }

  return (
    <div
      {...transitionProps}
      ref={node => {
        panelRef.current = node;
      }}
      data-testid='panel'
      data-height={height}
      data-width={width}
    />
  );
}

function holdAnimations() {
  Object.defineProperty(Element.prototype, 'getAnimations', {
    configurable: true,
    value: () => [{ finished: new Promise<void>(() => {}) }],
  });
}

function mockContentSize(height: number, width: number) {
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(height);
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(width);
}

describe('usePanelSize', () => {
  it('renders nothing while initially closed', () => {
    render(<Panel open={false} />);

    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('pins the measured size while the open animation runs', () => {
    holdAnimations();
    mockContentSize(120, 300);

    render(<Panel open />);

    const panel = screen.getByTestId('panel');
    expect(panel).toHaveAttribute('data-height', '120');
    expect(panel).toHaveAttribute('data-width', '300');
  });

  it('releases the size once the open animation settles', () => {
    mockContentSize(120, 300);

    render(<Panel open />);

    const panel = screen.getByTestId('panel');
    expect(panel).not.toHaveAttribute('data-height');
    expect(panel).not.toHaveAttribute('data-width');
  });

  it('pins the size again when closing starts', () => {
    mockContentSize(120, 300);
    const { rerender } = render(<Panel open />);
    const panel = screen.getByTestId('panel');
    expect(panel).not.toHaveAttribute('data-height');

    holdAnimations();
    mockContentSize(80, 200);
    rerender(<Panel open={false} />);

    expect(panel).toHaveAttribute('data-height', '80');
    expect(panel).toHaveAttribute('data-width', '200');
  });

  it('updates the pinned size when the content resizes', () => {
    holdAnimations();
    mockContentSize(120, 300);
    let notifyResize = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notifyResize = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<Panel open />);

    mockContentSize(160, 340);
    act(() => notifyResize());

    const panel = screen.getByTestId('panel');
    expect(panel).toHaveAttribute('data-height', '160');
    expect(panel).toHaveAttribute('data-width', '340');
  });

  it('keeps the same panel element when reopened while closing', () => {
    mockContentSize(120, 300);
    const { rerender } = render(<Panel open />);
    const panel = screen.getByTestId('panel');

    holdAnimations();
    rerender(<Panel open={false} />);
    mockContentSize(90, 210);
    rerender(<Panel open />);

    expect(screen.getByTestId('panel')).toBe(panel);
    expect(panel).toHaveAttribute('data-open');
  });

  it('does not throw when unmounted during an animation', () => {
    holdAnimations();
    mockContentSize(120, 300);
    const { unmount } = render(<Panel open />);

    expect(() => unmount()).not.toThrow();
  });
});
