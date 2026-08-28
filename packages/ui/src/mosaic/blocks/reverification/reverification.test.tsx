import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReverificationState } from './reverification';
import { Reverification } from './reverification';

const actions = {
  secondaryActionLabel: 'Use another method',
  primaryActionLabel: 'Continue',
  pendingLabel: 'Verifying',
};

function state(status: ReverificationState['status']): ReverificationState {
  const onValueChange = vi.fn();
  const onSubmit = vi.fn();

  return {
    status,
    password: {
      messages: {
        title: 'Verification required',
        description: 'Enter your password.',
        fieldLabel: 'Password',
        fieldPlaceholder: 'Enter your password',
        ...actions,
      },
      value: '',
      onValueChange,
      onSubmit,
    },
    passkey: {
      messages: {
        title: 'Use your passkey',
        description: 'Verify with your passkey.',
        ...actions,
      },
      onVerify: onSubmit,
    },
    otp: {
      messages: {
        title: 'Verification required',
        description: 'Enter the code from your authenticator.',
        fieldLabel: 'Verification code',
        ...actions,
      },
      value: '',
      onValueChange,
      onSubmit,
    },
    backupCode: {
      messages: {
        title: 'Enter a backup code',
        description: 'Enter one of your backup codes.',
        fieldLabel: 'Backup code',
        ...actions,
      },
      value: '',
      onValueChange,
      onSubmit,
    },
    methodPicker: {
      messages: {
        title: 'Use another method',
        description: 'Choose another way to verify.',
        backButton: 'Back',
        helpText: 'Need help?',
        helpButton: 'Get help',
      },
      methods: [],
      onSelect: vi.fn(),
      onHelp: vi.fn(),
    },
    help: {
      messages: {
        title: 'Get help',
        description: 'Contact support for help.',
        backButton: 'Back',
        supportButton: 'Email support',
      },
      onEmailSupport: vi.fn(),
      onBack: vi.fn(),
    },
  };
}

describe('Reverification', () => {
  it('keeps one Card and Flow surface while view props and panels change', () => {
    const { container, rerender } = render(<Reverification state={state('password')} />);

    const card = container.querySelector('.cl-card-root');
    const flow = container.querySelector('.cl-flow-root');
    const passwordStep = screen.getByLabelText('Password').closest('.cl-flow-step');

    expect(card).not.toBeNull();
    expect(flow).toBe(card);
    expect(flow).toHaveAttribute('data-value', 'password');

    const pendingPassword = state('password');
    pendingPassword.password.isPending = true;
    rerender(<Reverification state={pendingPassword} />);

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toBe(flow);
    expect(screen.getByLabelText('Password').closest('.cl-flow-step')).toBe(passwordStep);

    rerender(<Reverification state={state('otp')} />);

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toBe(flow);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Verification code')).toBeInTheDocument();
  });

  it('renders a passkey attempt error in a negative Banner', () => {
    const errorState = state('passkey');
    errorState.passkey.errorMessage = 'We couldn’t verify that passkey. Try again.';

    render(<Reverification state={errorState} />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('cl-banner-root');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('We couldn’t verify that passkey. Try again.');
  });
});
