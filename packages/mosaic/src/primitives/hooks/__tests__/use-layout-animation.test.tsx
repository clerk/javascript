import { cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { LAYOUT_ITEM_SELECTOR } from '../../utils/layout-animator';
import { useLayoutAnimation } from '../use-layout-animation';

afterEach(cleanup);

function List() {
  const ref = useRef<HTMLDivElement>(null);
  const { itemProps } = useLayoutAnimation(ref);
  return (
    <div ref={ref}>
      <span {...itemProps} />
    </div>
  );
}

function itemOf(container: HTMLElement) {
  const element = container.querySelector(LAYOUT_ITEM_SELECTOR);
  if (!(element instanceof HTMLElement)) {
    throw new Error('Layout item not found');
  }
  return element;
}

function flush() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('useLayoutAnimation', () => {
  it('returns props that mark an element as a layout item', () => {
    const { container } = render(<List />);

    expect(itemOf(container)).toBe(container.querySelector('span'));
  });

  it('pins an exiting item in the referenced element until unmount', async () => {
    const { container, unmount } = render(<List />);
    const item = itemOf(container);

    item.setAttribute('data-ending-style', '');
    await flush();

    expect(item).toHaveAttribute('data-layout-popped');
    expect(item.style.position).toBe('absolute');

    unmount();

    expect(item).not.toHaveAttribute('data-layout-popped');
    expect(item.style.position).toBe('');
  });
});
