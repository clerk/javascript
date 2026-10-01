import { render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createLayoutAnimator, LAYOUT_ITEM_SELECTOR } from '../utils/layout-animator';
import { useLayoutAnimation } from './use-layout-animation';

const dispose = vi.fn();

vi.mock('../utils/layout-animator', async importOriginal => ({
  ...(await importOriginal<typeof import('../utils/layout-animator')>()),
  createLayoutAnimator: vi.fn(() => dispose),
}));

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
  it('animates the referenced element until unmount', () => {
    const { container, unmount } = render(<List />);

    expect(createLayoutAnimator).toHaveBeenCalledWith(container.firstChild);
    expect(dispose).not.toHaveBeenCalled();

    unmount();

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('returns props that mark an element as a layout item', () => {
    const { container } = render(<List />);

    expect(container.querySelector(LAYOUT_ITEM_SELECTOR)).toBe(container.querySelector('span'));
  });
});
