import { render } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLayoutAnimator, LAYOUT_ITEM_SELECTOR } from '../../utils/layout-animator';
import { useLayoutAnimation } from '../use-layout-animation';

const disposers: Array<ReturnType<typeof vi.fn>> = [];

vi.mock('../../utils/layout-animator', async importOriginal => ({
  ...(await importOriginal<typeof import('../../utils/layout-animator')>()),
  createLayoutAnimator: vi.fn(() => {
    const dispose = vi.fn();
    disposers.push(dispose);
    return dispose;
  }),
}));

function liveAnimators() {
  return disposers.filter(dispose => dispose.mock.calls.length === 0).length;
}

function List() {
  const ref = useRef<HTMLDivElement>(null);
  const { itemProps } = useLayoutAnimation(ref);
  return (
    <div ref={ref}>
      <span {...itemProps} />
    </div>
  );
}

describe('useLayoutAnimation', () => {
  beforeEach(() => {
    disposers.length = 0;
  });

  it('animates the referenced element until unmount', () => {
    const { container, unmount } = render(<List />);

    expect(createLayoutAnimator).toHaveBeenCalledWith(container.firstChild);
    expect(liveAnimators()).toBe(1);

    unmount();

    expect(liveAnimators()).toBe(0);
    for (const dispose of disposers) {
      expect(dispose).toHaveBeenCalledTimes(1);
    }
  });

  it('returns props that mark an element as a layout item', () => {
    const { container } = render(<List />);

    expect(container.querySelector(LAYOUT_ITEM_SELECTOR)).toBe(container.querySelector('span'));
  });
});
