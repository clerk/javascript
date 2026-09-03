import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Input } from './input';

afterEach(() => cleanup());

describe('Input', () => {
  it('renders a native input and forwards its props and ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        aria-label='Name'
        name='name'
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('name', 'name');
    expect(ref.current).toBe(input);
  });

  it('reflects native state for styling', () => {
    render(
      <Input
        aria-label='Name'
        aria-invalid='true'
        disabled
        readOnly
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('data-disabled', '');
    expect(input).toHaveAttribute('data-invalid', '');
    expect(input).toHaveAttribute('data-readonly', '');
  });

  it('supports the headless render escape hatch', () => {
    render(
      <Input
        render={<textarea aria-label='Biography' />}
        data-input='grouped'
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Biography' });
    expect(input.tagName).toBe('TEXTAREA');
    expect(input).toHaveAttribute('data-input', 'grouped');
  });
});
