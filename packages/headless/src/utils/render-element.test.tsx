import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mergeProps, renderElement } from './render-element';

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

    (result.onClick as Function)();

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

describe('renderElement', () => {
  it('renders default tag when no render prop', () => {
    const element = renderElement({
      defaultTagName: 'span',
      props: { 'data-testid': 'test', children: 'hello' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveTextContent('hello');
  });

  it('renders custom element via render prop (element)', () => {
    const element = renderElement({
      defaultTagName: 'div',
      render: <section />,
      props: { 'data-testid': 'test', children: 'content' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el.tagName).toBe('SECTION');
  });

  it('renders via render function', () => {
    const element = renderElement({
      defaultTagName: 'div',
      render: props => <article {...props} />,
      props: { 'data-testid': 'test', children: 'content' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el.tagName).toBe('ARTICLE');
  });

  it('returns null when enabled is false', () => {
    const element = renderElement({
      defaultTagName: 'div',
      enabled: false,
      props: { children: 'hidden' },
    });

    expect(element).toBeNull();
  });

  it('renders when enabled is true', () => {
    const element = renderElement({
      defaultTagName: 'div',
      enabled: true,
      props: { 'data-testid': 'test', children: 'visible' },
    });

    render(element!);

    expect(screen.getByTestId('test')).toBeInTheDocument();
  });

  it('applies state attributes via stateAttributesMapping', () => {
    const element = renderElement({
      defaultTagName: 'button',
      state: { open: true },
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: { 'data-testid': 'test' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el).toHaveAttribute('data-cl-open', '');
    expect(el).not.toHaveAttribute('data-cl-closed');
  });

  it('applies false state attributes via stateAttributesMapping', () => {
    const element = renderElement({
      defaultTagName: 'button',
      state: { open: false },
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: { 'data-testid': 'test' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el).toHaveAttribute('data-cl-closed', '');
    expect(el).not.toHaveAttribute('data-cl-open');
  });

  it('skips null return from stateAttributesMapping', () => {
    const element = renderElement({
      defaultTagName: 'div',
      state: { selected: false },
      stateAttributesMapping: {
        selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      },
      props: { 'data-testid': 'test' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el).not.toHaveAttribute('data-cl-selected');
  });

  it('merges multiple state attribute mappings', () => {
    const element = renderElement({
      defaultTagName: 'div',
      state: { selected: true, active: true, disabled: false },
      stateAttributesMapping: {
        selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
        active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
      },
      props: { 'data-testid': 'test' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el).toHaveAttribute('data-cl-selected', '');
    expect(el).toHaveAttribute('data-cl-active', '');
    expect(el).not.toHaveAttribute('data-cl-disabled');
  });

  it('state attributes override props', () => {
    const element = renderElement({
      defaultTagName: 'div',
      state: { open: true },
      stateAttributesMapping: {
        open: () => ({ 'data-cl-open': '' }),
      },
      props: { 'data-testid': 'test', 'data-cl-open': 'should-be-overridden' },
    });

    render(element!);

    const el = screen.getByTestId('test');
    expect(el).toHaveAttribute('data-cl-open', '');
  });

  it('passes computed props to render function', () => {
    const renderFn = vi.fn(props => <div {...props} />);

    renderElement({
      defaultTagName: 'div',
      render: renderFn,
      state: { open: true },
      stateAttributesMapping: {
        open: (v: boolean) => (v ? { 'data-cl-open': '' } : null),
      },
      props: { id: 'test' },
    });

    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test',
        'data-cl-open': '',
      }),
    );
  });
});
