import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { UserProfileMfaSetupViewProps } from '../user-profile-mfa-setup.view';
import { MfaSetupDialog } from './mfa-test-utils';

type ViewProps = UserProfileMfaSetupViewProps['authenticator'];

const setup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

function renderView(overrides: Partial<ViewProps> = {}, step: UserProfileMfaSetupViewProps['step'] = 'authenticator') {
  const props: ViewProps = {
    setup,
    onRetry: vi.fn(),
    code: '',
    onCodeChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MfaSetupDialog
        step={step}
        authenticator={props}
      />,
    ),
  };
}

function VerificationExample({ onSubmit }: Pick<ViewProps, 'onSubmit'>) {
  const [code, setCode] = useState('');
  return (
    <MfaSetupDialog
      step='authenticator'
      authenticator={{ setup, onRetry: () => undefined, code, onCodeChange: setCode, onSubmit }}
    />
  );
}

describe('UserProfileAddAuthenticatorView', () => {
  it('shows preparation, offers retry on failure, and waits for setup data before verification', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ setup: undefined }, 'select');
    rerender(
      <MfaSetupDialog
        step='authenticator'
        authenticator={props}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Add an authenticator app' });
    expect(screen.getByRole('status', { name: 'Preparing authenticator…' })).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify', exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Preparing authenticator/ })).toHaveFocus();

    rerender(
      <MfaSetupDialog
        step='authenticator'
        authenticator={{ ...props, setupErrorMessage: 'Unable to prepare your authenticator.' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to prepare your authenticator.');
    expect(screen.queryByRole('status', { name: 'Preparing authenticator…' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).toHaveBeenCalledOnce();
    expect(props.onSubmit).not.toHaveBeenCalled();

    rerender(
      <MfaSetupDialog
        step='authenticator'
        authenticator={props}
      />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Preparing authenticator…' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Preparing authenticator/ })).toHaveFocus();

    rerender(
      <MfaSetupDialog
        step='authenticator'
        authenticator={{ ...props, setup }}
      />,
    );
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(screen.queryByRole('status', { name: 'Preparing authenticator…' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Verify', exact: true })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(props.onSubmit).not.toHaveBeenCalled();
    rerender(
      <MfaSetupDialog
        step='authenticator'
        authenticator={{ ...props, setup, code: '123456' }}
      />,
    );
    expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it('blocks incomplete and pending submissions, including native form submission', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ code: '123' });
    const verify = screen.getByRole('button', { name: 'Verify', exact: true });
    expect(verify).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
    await user.keyboard('{Enter}');
    expect(props.onSubmit).not.toHaveBeenCalled();

    rerender(
      <MfaSetupDialog
        step='authenticator'
        authenticator={{ ...props, code: '123456', isPending: true }}
      />,
    );
    expect(verify).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Verifying code' })).toBeInTheDocument();
    for (const slot of screen.getAllByRole('textbox')) {
      expect(slot).toBeDisabled();
    }
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    await user.click(verify);
    const form = screen.getByRole('textbox', { name: 'Verification code' }).closest('form');
    if (!form) {
      throw new Error('Verification form missing');
    }
    form.requestSubmit();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('keeps the entered code when switching between QR and manual setup', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VerificationExample onSubmit={onSubmit} />);
    await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
    await user.keyboard('123');
    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));
    await user.click(screen.getByRole('button', { name: 'Scan QR code instead' }));
    await user.click(screen.getByRole('textbox', { name: 'Character 4 of 6' }));
    await user.keyboard('456');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('123456');
  });
});
