import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReverificationModel } from '../reverification.view';
import { Reverification } from '../reverification.view';

const actions = {
  secondaryActionLabel: 'Use another method',
  primaryActionLabel: 'Continue',
  pendingLabel: 'Verifying',
};

function model(
  status: ReverificationModel['status'],
  direction: ReverificationModel['direction'] = 1,
): ReverificationModel {
  const onValueChange = vi.fn();
  const onSubmit = vi.fn();

  return {
    status,
    direction,
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
    const { container, rerender } = render(<Reverification {...model('password')} />);

    const card = container.querySelector('.cl-card-root');
    const flow = container.querySelector('.cl-flow-root');
    const passwordStep = screen.getByLabelText('Password').closest('.cl-flow-step');

    expect(card).not.toBeNull();
    expect(card).toContainElement(flow);
    expect(flow).toHaveAttribute('data-value', 'password');

    const pendingPassword = model('password');
    pendingPassword.password.isPending = true;
    rerender(<Reverification {...pendingPassword} />);

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toBe(flow);
    expect(screen.getByLabelText('Password').closest('.cl-flow-step')).toBe(passwordStep);

    rerender(<Reverification {...model('otp', -1)} />);

    expect(container.querySelector('.cl-card-root')).toBe(card);
    expect(container.querySelector('.cl-flow-root')).toBe(flow);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    const otpStep = screen.getByRole('group', { name: 'Verification code' }).closest('.cl-flow-step');
    expect(otpStep).toBeInTheDocument();
    expect(otpStep?.style.getPropertyValue('--cl-flow-transition-direction')).toBe('-1');
  });

  it('does not render Card branding', () => {
    render(<Reverification {...model('password')} />);

    expect(screen.queryByText('Secured by')).not.toBeInTheDocument();
  });

  it('renders a passkey attempt error in a negative Banner', () => {
    const errorModel = model('passkey');
    errorModel.passkey.errorMessage = 'We couldn’t verify that passkey. Try again.';

    render(<Reverification {...errorModel} />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('cl-banner-root');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveTextContent('We couldn’t verify that passkey. Try again.');
  });
});
