import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './checkbox';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Checkbox', () => {
  it('renders a native checkbox wrapped in the slot element', () => {
    render(<Checkbox aria-label='Select row' />);
    const input = screen.getByRole('checkbox', { name: 'Select row' });
    expect(input).toHaveClass('cl-checkbox-input');
    expect(input.parentElement).toHaveClass('cl-checkbox');
    expect(input.parentElement).toHaveAttribute('data-size', 'md');
  });

  it('toggles and reports changes', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox
        aria-label='Select row'
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('checkbox');
    await userEvent.click(input);
    expect(input).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports a controlled checked state', () => {
    render(
      <Checkbox
        aria-label='Select row'
        checked
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('applies the indeterminate state through the DOM property', () => {
    const { rerender } = render(
      <Checkbox
        aria-label='Select all'
        indeterminate
      />,
    );
    const input = screen.getByRole<HTMLInputElement>('checkbox');
    expect(input.indeterminate).toBe(true);

    rerender(<Checkbox aria-label='Select all' />);
    expect(input.indeterminate).toBe(false);
  });

  it('disables the input', () => {
    render(
      <Checkbox
        aria-label='Select row'
        disabled
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('merges xstyle atoms onto the slot element', () => {
    render(
      <Checkbox
        aria-label='Select row'
        xstyle={atoms.spaced}
      />,
    );
    expect(screen.getByRole('checkbox').parentElement).toHaveClass(
      'cl-checkbox',
      stylex.props(atoms.spaced).className ?? '',
    );
  });

  it('forwards the ref and arbitrary input props to the input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Checkbox
        ref={ref}
        aria-label='Select row'
        name='rows'
        value='1'
      />,
    );
    const input = screen.getByRole('checkbox');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'rows');
    expect(input).toHaveAttribute('value', '1');
  });
});
