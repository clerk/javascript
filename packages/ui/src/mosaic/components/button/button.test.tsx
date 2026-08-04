import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Mosaic Button', () => {
  it('renders a button with its children', () => {
    render(<Button>Hi</Button>);
    expect(screen.getByRole('button', { name: 'Hi' })).toBeInTheDocument();
  });

  it('applies default variants when none are passed', () => {
    render(<Button>Hi</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('cl-button');
    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('data-variant', 'filled');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveAttribute('data-shape', 'default');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('omits the boolean modifiers when they are off', () => {
    render(<Button>Hi</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('data-full-width');
    expect(button).not.toHaveAttribute('data-disabled');
    expect(button).toBeEnabled();
  });

  // The touch target is an overlay with no attribute of its own, so these compare the atoms
  // the element ends up with rather than a reflected variant.
  it('drops the touch-target atoms when the prop is off', () => {
    const { rerender } = render(<Button>Hi</Button>);
    const on = screen.getByRole('button').className.split(' ');
    rerender(<Button touchTarget={false}>Hi</Button>);
    const off = screen.getByRole('button').className.split(' ');
    expect(off.length).toBeLessThan(on.length);
    expect(off.every(atom => on.includes(atom))).toBe(true);
  });

  it('leaves the touch target off a link, which is text rather than a control', () => {
    const { rerender } = render(<Button variant='link'>Hi</Button>);
    const on = screen.getByRole('button').className;
    rerender(
      <Button
        variant='link'
        touchTarget={false}
      >
        Hi
      </Button>,
    );
    expect(screen.getByRole('button').className).toBe(on);
  });

  it('keeps the touch-target prop off the element', () => {
    render(<Button touchTarget={false}>Hi</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('touchtarget');
  });

  it('wires variant props and consumer className/style through to the element', () => {
    render(
      <Button
        color='negative'
        variant='outline'
        size='sm'
        shape='circle'
        fullWidth
        className='my-button'
        style={{ marginTop: '8px' }}
      >
        Hi
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-color', 'negative');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-shape', 'circle');
    expect(button).toHaveAttribute('data-full-width', '');
    expect(button).toHaveClass('cl-button', 'my-button');
    expect(button).toHaveStyle({ marginTop: '8px' });
  });

  it.each(['primary', 'neutral', 'negative'] as const)('reflects the %s color', color => {
    render(<Button color={color}>Hi</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-color', color);
  });

  it.each(['filled', 'outline', 'ghost', 'link'] as const)('reflects the %s variant', variant => {
    render(<Button variant={variant}>Hi</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
  });

  it.each(['sm', 'md', 'lg'] as const)('reflects the %s size', size => {
    render(<Button size={size}>Hi</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'square', 'circle'] as const)('reflects the %s shape', shape => {
    render(<Button shape={shape}>Hi</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-shape', shape);
  });

  it('gives a text child its own box to truncate against', () => {
    render(<Button>Hi</Button>);
    const label = screen.getByRole('button').firstElementChild;
    expect(label?.tagName).toBe('SPAN');
    expect(label).toHaveTextContent('Hi');
  });

  it('keeps a run of adjacent text in one box so the gap stays out of the sentence', () => {
    render(<Button>Delete {'Alice'}</Button>);
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(1);
    expect(button.firstElementChild?.tagName).toBe('SPAN');
    expect(button).toHaveAccessibleName('Delete Alice');
  });

  it('splits the label runs around an element child', () => {
    render(
      <Button>
        Delete
        <svg data-testid='icon' />
        {'Alice'}
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(3);
    expect(button.children[0]).toHaveTextContent('Delete');
    expect(button.children[1]).toBe(screen.getByTestId('icon'));
    expect(button.children[2]).toHaveTextContent('Alice');
  });

  it('leaves element children as direct children so the gap still applies', () => {
    render(
      <Button>
        <svg data-testid='icon' />
        Hi
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(2);
    expect(button.firstElementChild).toBe(screen.getByTestId('icon'));
    expect(button.lastElementChild?.tagName).toBe('SPAN');
    expect(button).toHaveAccessibleName('Hi');
  });

  it('boxes a numeric child the same as text', () => {
    render(<Button>{3}</Button>);
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(1);
    expect(button.firstElementChild?.tagName).toBe('SPAN');
    expect(button).toHaveAccessibleName('3');
  });

  it('opens no label box for children that render nothing', () => {
    render(
      <Button aria-label='Close'>
        {null}
        <svg data-testid='icon' />
        {false}
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(1);
    expect(button.firstElementChild).toBe(screen.getByTestId('icon'));
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hi</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button
        disabled
        onClick={onClick}
      >
        Hi
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('reflects disabled as both the native attribute and data-disabled', () => {
    render(<Button disabled>Hi</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled', '');
  });

  describe('focusableWhenDisabled', () => {
    it('marks the button aria-disabled instead of disabled', () => {
      render(
        <Button
          disabled
          focusableWhenDisabled
        >
          Hi
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      // The styles gate every interactive state on `data-disabled`, so it has to be
      // reflected identically whether or not the native attribute is present.
      expect(button).toHaveAttribute('data-disabled', '');
    });

    it('stays reachable by keyboard', async () => {
      render(
        <Button
          disabled
          focusableWhenDisabled
        >
          Hi
        </Button>,
      );
      await userEvent.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('does not call onClick while disabled', async () => {
      const onClick = vi.fn();
      render(
        <Button
          disabled
          focusableWhenDisabled
          onClick={onClick}
        >
          Hi
        </Button>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('still dims and blocks the cursor', () => {
      const { rerender } = render(<Button disabled>Hi</Button>);
      const nativelyDisabled = screen.getByRole('button').className;
      rerender(
        <Button
          disabled
          focusableWhenDisabled
        >
          Hi
        </Button>,
      );
      expect(screen.getByRole('button').className).toBe(nativelyDisabled);
    });
  });

  it('forwards arbitrary button props and the ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Button
        ref={ref}
        type='submit'
        aria-label='Submit'
      >
        Hi
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit');
  });
});
