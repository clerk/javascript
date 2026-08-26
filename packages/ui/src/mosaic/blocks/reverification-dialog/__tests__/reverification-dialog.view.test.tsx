import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  ReverificationDialogVerifyViewProps,
  ReverificationDialogViewProps,
  ReverificationEmailCodeFactor,
  ReverificationPasskeyFactor,
  ReverificationPasswordFactor,
} from '../reverification-dialog.types';
import { ReverificationDialogView } from '../reverification-dialog.view';

const passwordFactor: ReverificationPasswordFactor = {
  id: 'password',
  label: 'Password',
  stage: 'first',
  strategy: 'password',
};

const emailFactor: ReverificationEmailCodeFactor = {
  id: 'email_1',
  label: 'Email code to a••••@clerk.dev',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'email_1',
  safeIdentifier: 'a••••@clerk.dev',
};

const passkeyFactor: ReverificationPasskeyFactor = {
  id: 'passkey',
  label: 'Passkey',
  stage: 'first',
  strategy: 'passkey',
};

const verifyProps = (
  overrides: Partial<ReverificationDialogVerifyViewProps> = {},
): ReverificationDialogVerifyViewProps => ({
  open: true,
  step: 'verify',
  factor: passwordFactor,
  value: '',
  canSubmit: false,
  isInputDisabled: false,
  isVerifying: false,
  onOpenChange: vi.fn(),
  onValueChange: vi.fn(),
  onSubmit: vi.fn(),
  ...overrides,
});

afterEach(() => cleanup());

describe('ReverificationDialogView', () => {
  it('is controlled by open and onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const view = render(<ReverificationDialogView {...verifyProps({ open: false, onOpenChange })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    view.rerender(<ReverificationDialogView {...verifyProps({ onOpenChange })} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('forwards password input and form submission through flat callbacks', async () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const view = render(<ReverificationDialogView {...verifyProps({ onSubmit, onValueChange })} />);

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    expect(onValueChange).toHaveBeenCalledWith('secret');

    view.rerender(
      <ReverificationDialogView {...verifyProps({ canSubmit: true, onSubmit, onValueChange, value: 'secret' })} />,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('reports delivered-code input without owning normalization or completion', () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    render(<ReverificationDialogView {...verifyProps({ factor: emailFactor, onSubmit, onValueChange })} />);

    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '12a3456' } });

    expect(onValueChange).toHaveBeenCalledWith('12a3456');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps the code-entry modal visible while preparation disables its input', () => {
    render(
      <ReverificationDialogView
        {...verifyProps({
          factor: emailFactor,
          isInputDisabled: true,
          resend: { isResending: true, secondsRemaining: 0 },
        })}
      />,
    );

    expect(screen.getByLabelText('Verification code')).toBeDisabled();
    expect(screen.getByText(/Enter the verification code sent to/)).toBeInTheDocument();
    expect(screen.queryByText(/Preparing verification/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders factor selection as prop-driven actions', async () => {
    const onSelectFactor = vi.fn();
    const props: ReverificationDialogViewProps = {
      open: true,
      step: 'select-factor',
      stage: 'first',
      availableFactors: [passkeyFactor],
      onOpenChange: vi.fn(),
      onSelectFactor,
      onShowHelp: vi.fn(),
    };
    render(<ReverificationDialogView {...props} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Passkey' }));

    expect(onSelectFactor).toHaveBeenCalledWith(passkeyFactor.id);
  });

  it('renders only valid navigation actions supplied by the machine', async () => {
    const onShowHelp = vi.fn();
    render(<ReverificationDialogView {...verifyProps({ onShowHelp })} />);

    expect(screen.queryByRole('button', { name: 'Use another method' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Having trouble?' }));
    expect(onShowHelp).toHaveBeenCalledOnce();
  });

  it('exposes verification progress and errors accessibly', () => {
    render(
      <ReverificationDialogView
        {...verifyProps({
          value: 'wrong',
          canSubmit: false,
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
    render(<ReverificationDialogView {...verifyProps({ factor: passkeyFactor, canSubmit: true })} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify with passkey' })).toBeEnabled();
  });

  it('renders a machine-owned resend countdown as inert', async () => {
    const onResend = vi.fn();
    render(
      <ReverificationDialogView
        {...verifyProps({
          factor: emailFactor,
          resend: { isResending: false, secondsRemaining: 30 },
          onResend,
        })}
      />,
    );

    const resend = screen.getByRole('button', { name: 'Resend (30s)' });
    expect(resend).toHaveAttribute('aria-disabled', 'true');
    await userEvent.setup().click(resend);
    expect(onResend).not.toHaveBeenCalled();
  });
});
