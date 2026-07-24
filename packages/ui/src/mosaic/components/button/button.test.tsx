import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

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
    expect(button).toHaveAttribute('data-intent', 'primary');
    expect(button).toHaveAttribute('data-variant', 'filled');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveAttribute('data-shape', 'default');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('wires variant props and consumer className/style through to the element', () => {
    render(
      <Button
        intent='destructive'
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
    expect(button).toHaveAttribute('data-intent', 'destructive');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-shape', 'circle');
    expect(button).toHaveAttribute('data-full-width', '');
    expect(button).toHaveClass('cl-button', 'my-button');
    expect(button).toHaveStyle({ marginTop: '8px' });
  });

  it('reflects disabled as both the native attribute and data-disabled', () => {
    render(<Button disabled>Hi</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled', '');
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
