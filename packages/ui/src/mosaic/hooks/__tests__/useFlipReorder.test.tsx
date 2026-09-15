import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { durationVars, easingVars } from '../../tokens.stylex';
import { useFlipReorder } from '../useFlipReorder';

const ROW_HEIGHT = 40;
const EASING = 'cubic-bezier(0.1, 0.2, 0.3, 1)';

function List({ order }: { order: string[] }) {
  const ref = useFlipReorder<HTMLUListElement>(order);
  return (
    <ul
      ref={ref}
      data-testid='list'
    >
      {order.map(id => (
        <li
          key={id}
          data-testid={id}
        >
          {id}
        </li>
      ))}
    </ul>
  );
}

function customPropertyName(reference: string) {
  const name = reference.match(/^var\((--[\w-]+)\)$/)?.[1];
  if (!name) {
    throw new Error(`Not a token reference: ${reference}`);
  }
  return name;
}

function defineTokens(element: HTMLElement) {
  element.style.setProperty(customPropertyName(durationVars['--cl-duration-slow']), '0.25s');
  element.style.setProperty(customPropertyName(easingVars['--cl-ease-enter']), EASING);
}

describe('useFlipReorder', () => {
  const originalRect = Element.prototype.getBoundingClientRect;
  const originalMatchMedia = window.matchMedia;
  let animate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    animate = vi.spyOn(HTMLElement.prototype, 'animate');
    Element.prototype.getBoundingClientRect = function () {
      const index = this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : 0;
      const top = index * ROW_HEIGHT;
      return {
        top,
        left: 0,
        bottom: top + ROW_HEIGHT,
        right: 100,
        width: 100,
        height: ROW_HEIGHT,
        x: 0,
        y: top,
        toJSON: () => ({}),
      };
    };
  });

  afterEach(() => {
    animate.mockRestore();
    Element.prototype.getBoundingClientRect = originalRect;
    window.matchMedia = originalMatchMedia;
  });

  it('animates moved children from their old position at the Mosaic duration and easing', () => {
    const { rerender } = render(<List order={['a', 'b', 'c']} />);
    defineTokens(screen.getByTestId('list'));
    rerender(<List order={['c', 'a', 'b']} />);

    expect(animate).toHaveBeenCalledTimes(3);
    const options = { duration: 250, easing: EASING };
    expect(animate.mock.instances[0]).toBe(screen.getByTestId('c'));
    expect(animate).toHaveBeenNthCalledWith(
      1,
      [{ transform: `translate(0px, ${2 * ROW_HEIGHT}px)` }, { transform: 'none' }],
      options,
    );
    expect(animate.mock.instances[1]).toBe(screen.getByTestId('a'));
    expect(animate).toHaveBeenNthCalledWith(
      2,
      [{ transform: `translate(0px, ${-ROW_HEIGHT}px)` }, { transform: 'none' }],
      options,
    );
    expect(animate.mock.instances[2]).toBe(screen.getByTestId('b'));
  });

  it('leaves children alone when the order is unchanged or they are new', () => {
    const { rerender } = render(<List order={['a', 'b']} />);
    defineTokens(screen.getByTestId('list'));
    rerender(<List order={['a', 'b']} />);
    rerender(<List order={['a', 'b', 'c']} />);

    expect(animate).not.toHaveBeenCalled();
  });

  it('does not animate under prefers-reduced-motion', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { rerender } = render(<List order={['a', 'b']} />);
    defineTokens(screen.getByTestId('list'));
    rerender(<List order={['b', 'a']} />);

    expect(animate).not.toHaveBeenCalled();
  });

  it('does not animate when the motion tokens are not defined', () => {
    const { rerender } = render(<List order={['a', 'b']} />);
    rerender(<List order={['b', 'a']} />);

    expect(animate).not.toHaveBeenCalled();
  });
});
