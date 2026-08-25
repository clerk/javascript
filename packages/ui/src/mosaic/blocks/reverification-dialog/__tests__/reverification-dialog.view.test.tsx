import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ReverificationDialogViewProps } from '../reverification-dialog.types';
import { ReverificationDialogView } from '../reverification-dialog.view';

afterEach(() => cleanup());

const createProps = (overrides: Partial<ReverificationDialogViewProps> = {}): ReverificationDialogViewProps => ({
  open: true,
  strategy: 'password',
  value: '',
  onOpenChange: vi.fn(),
  onValueChange: vi.fn(),
  onSubmit: vi.fn(),
  onResend: vi.fn(),
  ...overrides,
});

describe('ReverificationDialogView', () => {
  it('is controlled by open and onOpenChange props', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<ReverificationDialogView {...createProps({ open: false, onOpenChange })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<ReverificationDialogView {...createProps({ onOpenChange })} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('forwards password input and form submission through flat callbacks', async () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const { rerender } = render(<ReverificationDialogView {...createProps({ onSubmit, onValueChange })} />);

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    expect(onValueChange).toHaveBeenCalledWith('secret');

    rerender(<ReverificationDialogView {...createProps({ onSubmit, onValueChange, value: 'secret' })} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('normalizes a delivered code and submits when six digits are controlled back in', async () => {
    const onSubmit = vi.fn();

    function ControlledCodeDialog() {
      const [value, setValue] = React.useState('');
      return (
        <ReverificationDialogView
          {...createProps({
            strategy: 'email_code',
            identifier: 'a••••@clerk.dev',
            value,
            onValueChange: setValue,
            onSubmit,
          })}
        />
      );
    }

    render(<ControlledCodeDialog />);
    await userEvent.setup().type(screen.getByLabelText('Verification code'), '12a3456');

    expect(screen.getByLabelText('Verification code')).toHaveValue('123456');
    expect(onSubmit).toHaveBeenCalledWith('123456');
  });

  it('renders factor selection as prop-driven actions', async () => {
    const onSelectFactor = vi.fn();
    render(
      <ReverificationDialogView
        {...createProps({
          step: 'select-first-factor',
          availableFactors: [{ id: 'passkey', strategy: 'passkey', label: 'Passkey' }],
          onSelectFactor,
        })}
      />,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Passkey' }));

    expect(onSelectFactor).toHaveBeenCalledWith('passkey');
  });

  it('exposes verification progress and errors accessibly', () => {
    render(
      <ReverificationDialogView
        {...createProps({
          value: 'wrong',
          isVerifying: true,
          fieldError: 'Incorrect password.',
          formError: 'Verification failed.',
        })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Verification failed.');
    expect(screen.getByText('Incorrect password.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Verifying identity' })).toBeInTheDocument();
  });

  it('renders passkey verification without an input', () => {
    render(<ReverificationDialogView {...createProps({ strategy: 'passkey' })} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify with passkey' })).toBeEnabled();
  });
});
