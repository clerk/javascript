import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Field } from '../field';
import { PasswordInput } from './password-input';

function renderPasswordInput() {
  render(
    <Field.Root>
      <Field.Label>Password</Field.Label>
      <PasswordInput
        defaultValue='hunter2'
        showPasswordLabel='Show password'
        hidePasswordLabel='Hide password'
      />
    </Field.Root>,
  );
  return userEvent.setup();
}

describe('Mosaic PasswordInput', () => {
  it('hides the password until the toggle shows it, then hides it again', async () => {
    const user = renderPasswordInput();
    const input = screen.getByLabelText('Password');

    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('hunter2');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('disables the toggle when disabled outside a field', async () => {
    render(
      <PasswordInput
        aria-label='Password'
        disabled
        showPasswordLabel='Show password'
        hidePasswordLabel='Hide password'
      />,
    );
    const user = userEvent.setup();
    const input = screen.getByLabelText('Password');

    expect(input).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
