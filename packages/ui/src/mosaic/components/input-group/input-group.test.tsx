import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Field } from '../field';
import { Input } from '../input';
import { InputGroup } from './input-group';

describe('Mosaic InputGroup', () => {
  it('composes text and a headless input inside one control', () => {
    render(
      <InputGroup.Root>
        <InputGroup.Text>https://</InputGroup.Text>
        <Input
          variant='headless'
          aria-label='Domain'
        />
        <InputGroup.Text>.com</InputGroup.Text>
      </InputGroup.Root>,
    );

    const group = document.querySelector('.cl-input-group');
    const input = screen.getByRole('textbox', { name: 'Domain' });
    expect(group).toHaveAttribute('data-size', 'md');
    expect(input).toHaveClass('cl-input');
    expect(input).toHaveAttribute('data-variant', 'headless');
    expect(screen.getByText('https://')).toHaveClass('cl-input-group-text');
    expect(screen.getByText('.com')).toHaveClass('cl-input-group-text');
  });

  it.each(['sm', 'md', 'lg'] as const)('shares the %s size with its parts', size => {
    render(
      <InputGroup.Root size={size}>
        <InputGroup.Text>Prefix</InputGroup.Text>
        <Input
          variant='headless'
          aria-label='Value'
        />
      </InputGroup.Root>,
    );

    expect(document.querySelector('.cl-input-group')).toHaveAttribute('data-size', size);
    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveAttribute('data-size', size);
    expect(screen.getByText('Prefix')).toHaveAttribute('data-size', size);
  });

  it.each(['sm', 'md', 'lg'] as const)('shares the %s size and disabled state with an action', size => {
    render(
      <InputGroup.Root
        size={size}
        disabled
      >
        <Input
          variant='headless'
          aria-label='Value'
        />
        <InputGroup.Action aria-label='Show options' />
      </InputGroup.Root>,
    );

    const action = screen.getByRole('button', { name: 'Show options' });
    expect(action).toHaveClass('cl-button', 'cl-input-group-action');
    expect(action).toHaveAttribute('data-size', size);
    expect(action).toHaveAttribute('data-variant', 'ghost');
    expect(action).toHaveAttribute('data-color', 'neutral');
    expect(action).toBeDisabled();
  });

  it('allows an action to use a more compact button size', () => {
    render(
      <InputGroup.Root>
        <Input
          variant='headless'
          aria-label='Value'
        />
        <InputGroup.Action
          size='xs'
          shape='square'
          aria-label='Show options'
        />
      </InputGroup.Root>,
    );

    expect(screen.getByRole('button', { name: 'Show options' })).toHaveAttribute('data-size', 'xs');
  });

  it('inherits Field state and associates its label and messages with the input', () => {
    render(
      <Field.Root
        disabled
        required
        invalid
      >
        <Field.Label>Website</Field.Label>
        <InputGroup.Root>
          <InputGroup.Text>https://</InputGroup.Text>
          <Input variant='headless' />
        </InputGroup.Root>
        <Field.Error>Enter a valid website</Field.Error>
      </Field.Root>,
    );

    const group = document.querySelector('.cl-input-group');
    const input = screen.getByRole('textbox', { name: 'Website' });
    expect(group).toHaveAttribute('data-disabled', '');
    expect(group).toHaveAttribute('data-invalid', '');
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid website');
  });

  it('lets text focus the grouped input without changing its value', async () => {
    const user = userEvent.setup();
    render(
      <InputGroup.Root>
        <Input
          variant='headless'
          aria-label='Email username'
        />
        <InputGroup.Text>@acme.com</InputGroup.Text>
      </InputGroup.Root>,
    );

    await user.click(screen.getByText('@acme.com'));

    expect(screen.getByRole('textbox', { name: 'Email username' })).toHaveFocus();
  });

  it('forwards native input props and the input ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <InputGroup.Root>
        <Input
          ref={ref}
          variant='headless'
          name='domain'
          placeholder='example'
        />
      </InputGroup.Root>,
    );

    const input = screen.getByPlaceholderText('example');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'domain');
  });
});
