import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Mosaic Input', () => {
  it('applies the default size', () => {
    render(<Input aria-label='Name' />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveClass('cl-input');
    expect(input).toHaveAttribute('data-size', 'md');
    expect(input).not.toHaveAttribute('data-disabled');
    expect(input).toBeEnabled();
  });

  it.each(['sm', 'md', 'lg'] as const)('reflects the %s size', size => {
    render(
      <Input
        size={size}
        aria-label='Name'
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('data-size', size);
  });

  it('reflects and forwards the disabled state', () => {
    render(
      <Input
        disabled
        aria-label='Name'
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('data-disabled', '');
  });

  it('forwards aria-invalid without reflecting general browser invalidity', () => {
    render(
      <>
        <Input
          aria-invalid='true'
          aria-label='ARIA invalid'
        />
        <Input
          required
          aria-label='Browser invalid'
        />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'ARIA invalid' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'Browser invalid' })).not.toHaveAttribute('aria-invalid');
  });

  it('merges consumer className and inline styles', () => {
    render(
      <Input
        className='my-input'
        style={{ marginTop: '8px' }}
        aria-label='Name'
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveClass('cl-input', 'my-input');
    expect(input).toHaveStyle({ marginTop: '8px' });
  });

  it('forwards native props and the ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        name='displayName'
        placeholder='Name'
      />,
    );
    const input = screen.getByPlaceholderText('Name');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'displayName');
  });

  it('renders a custom element via render while keeping the styling contract', () => {
    render(
      <Input
        render={<textarea aria-label='Biography' />}
        size='sm'
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Biography' });
    expect(input.tagName).toBe('TEXTAREA');
    expect(input).toHaveClass('cl-input');
    expect(input).toHaveAttribute('data-size', 'sm');
  });

  it('lets consumer data attributes override generated ones', () => {
    render(
      <Input
        size='sm'
        data-size='consumer'
        aria-label='Name'
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('data-size', 'consumer');
  });
});
