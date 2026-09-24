import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

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

  it('reflects the ghost variant', () => {
    render(
      <Input
        variant='ghost'
        aria-label='Search'
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(input).toHaveClass('cl-input');
    expect(input).toHaveAttribute('data-variant', 'ghost');
    expect(input).not.toHaveFocus();
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

  it('merges xstyle atoms after the slot atoms', () => {
    render(
      <Input
        xstyle={atoms.spaced}
        aria-label='Name'
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveClass('cl-input', stylex.props(atoms.spaced).className ?? '');
  });

  it('merges a className carried by the render element instead of clobbering the slot class', () => {
    render(
      <Input
        aria-label='Name'
        render={<input className='from-source' />}
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('cl-input', 'from-source');
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
