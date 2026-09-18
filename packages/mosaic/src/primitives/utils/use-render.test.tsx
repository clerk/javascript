import { cleanup, render, renderHook, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mergeProps, useRender } from './use-render';

afterEach(() => {
  cleanup();
});

describe('mergeProps', () => {
  it('merges two plain objects', () => {
    const result = mergeProps<'div'>({ id: 'a', 'data-x': '1' }, { 'data-y': '2' });
    expect(result).toEqual({ id: 'a', 'data-x': '1', 'data-y': '2' });
  });

  it('second argument overrides first for plain props', () => {
    const result = mergeProps<'div'>({ id: 'a' }, { id: 'b' });
    expect(result.id).toBe('b');
  });

  it('chains event handlers', () => {
    const first = vi.fn();
    const second = vi.fn();
    const result = mergeProps<'button'>({ onClick: first }, { onClick: second });

    (result.onClick as (...args: unknown[]) => void)();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('shallow-merges style objects', () => {
    const result = mergeProps<'div'>(
      { style: { color: 'red', fontSize: 14 } },
      { style: { color: 'blue', padding: 8 } },
    );
    expect(result.style).toEqual({
      color: 'blue',
      fontSize: 14,
      padding: 8,
    });
  });

  it('concatenates className', () => {
    const result = mergeProps<'div'>({ className: 'base' }, { className: 'extra' });
    expect(result.className).toBe('base extra');
  });

  it('does not chain non-event-handler functions', () => {
    const ref1 = vi.fn();
    const ref2 = vi.fn();
    const result = mergeProps<'div'>({ ref: ref1 }, { ref: ref2 });
    // ref is not an event handler (doesn't match /^on[A-Z]/), so it's overwritten
    expect(result.ref).toBe(ref2);
  });
});

describe('useRender', () => {
  it('renders the default tag when no render prop', () => {
    function C() {
      return useRender({ defaultTagName: 'span', props: { 'data-testid': 'test', children: 'hello' } });
    }
    render(<C />);

    const el = screen.getByTestId('test');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveTextContent('hello');
  });

  it('renders via a render function', () => {
    function C() {
      return useRender({
        defaultTagName: 'div',
        render: props => <article {...props} />,
        props: { 'data-testid': 'test', children: 'content' },
      });
    }
    render(<C />);

    expect(screen.getByTestId('test').tagName).toBe('ARTICLE');
  });

  it('renders via a render element (clones it)', () => {
    function C() {
      return useRender({
        defaultTagName: 'div',
        render: <article data-variant='x' />,
        props: { 'data-testid': 'test', children: 'content' },
      });
    }
    render(<C />);

    const el = screen.getByTestId('test');
    expect(el.tagName).toBe('ARTICLE');
    expect(el).toHaveAttribute('data-variant', 'x');
    expect(el).toHaveTextContent('content');
  });

  it('returns null when enabled is false', () => {
    const { result } = renderHook(() =>
      useRender({ defaultTagName: 'div', enabled: false, props: { children: 'hidden' } }),
    );
    expect(result.current).toBeNull();
  });

  it('applies state attributes via stateAttributesMapping', () => {
    function C() {
      return useRender({
        defaultTagName: 'button',
        state: { open: true },
        stateAttributesMapping: {
          open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
        },
        props: { 'data-testid': 'test' },
      });
    }
    render(<C />);

    const el = screen.getByTestId('test');
    expect(el).toHaveAttribute('data-open', '');
    expect(el).not.toHaveAttribute('data-closed');
  });

  it('merges a single ref onto the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    function C() {
      return useRender({ defaultTagName: 'div', ref, props: { 'data-testid': 'test' } });
    }
    render(<C />);

    expect(ref.current).toBe(screen.getByTestId('test'));
  });

  it('merges an array of refs onto the rendered element', () => {
    const refA = React.createRef<HTMLDivElement>();
    const refB = vi.fn();
    function C() {
      return useRender({ defaultTagName: 'div', ref: [refA, refB], props: { 'data-testid': 'test' } });
    }
    render(<C />);

    const el = screen.getByTestId('test');
    expect(refA.current).toBe(el);
    expect(refB).toHaveBeenCalledWith(el);
  });

  it("merges a render element's own ref with the params ref", () => {
    const paramRef = React.createRef<HTMLElement>();
    const elementRef = React.createRef<HTMLElement>();
    function C() {
      return useRender({
        defaultTagName: 'div',
        ref: paramRef,
        render: (
          <article
            ref={elementRef}
            data-testid='test'
          />
        ),
      });
    }
    render(<C />);

    const el = screen.getByTestId('test');
    expect(paramRef.current).toBe(el);
    expect(elementRef.current).toBe(el);
  });

  it('concatenates className when cloning a render element', () => {
    function C() {
      return useRender({
        defaultTagName: 'div',
        render: (
          <article
            className='from-element'
            data-testid='test'
          />
        ),
        props: { className: 'from-part' },
      });
    }
    render(<C />);

    expect(screen.getByTestId('test')).toHaveClass('from-part', 'from-element');
  });

  it('chains event handlers when cloning a render element', () => {
    const partHandler = vi.fn();
    const elementHandler = vi.fn();
    function C() {
      return useRender({
        defaultTagName: 'button',
        render: (
          <button
            type='button'
            onClick={elementHandler}
            data-testid='test'
          />
        ),
        props: { onClick: partHandler },
      });
    }
    render(<C />);

    screen.getByTestId('test').click();

    expect(partHandler).toHaveBeenCalledTimes(1);
    expect(elementHandler).toHaveBeenCalledTimes(1);
  });

  it('passes computed props plus a merged ref to the render function', () => {
    const ref = React.createRef<HTMLDivElement>();
    const renderFn = vi.fn((props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />);
    function C() {
      return useRender({
        defaultTagName: 'div',
        render: renderFn,
        ref,
        state: { open: true },
        stateAttributesMapping: {
          open: (v: boolean) => (v ? { 'data-open': '' } : null),
        },
        props: { id: 'test' },
      });
    }
    render(<C />);

    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test',
        'data-open': '',
        ref: expect.any(Function),
      }),
    );
  });
});
