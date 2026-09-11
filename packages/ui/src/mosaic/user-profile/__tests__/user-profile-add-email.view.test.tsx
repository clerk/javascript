import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileAddEmailViewProps } from '../user-profile-add-email.view';
import { UserProfileAddEmailView } from '../user-profile-add-email.view';

function renderView(overrides: Partial<UserProfileAddEmailViewProps> = {}) {
  const props: UserProfileAddEmailViewProps = {
    open: true,
    onOpenChange: vi.fn(),
    step: 'email',
    emailAddress: 'person@example.com',
    onEmailAddressChange: vi.fn(),
    code: '',
    onCodeChange: vi.fn(),
    onSubmit: vi.fn(),
    onResend: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileAddEmailView {...props} />
      </MosaicProvider>,
    ),
  };
}

function VerificationExample({ onSubmit }: Pick<UserProfileAddEmailViewProps, 'onSubmit'>) {
  const [code, setCode] = useState('');

  return (
    <MosaicProvider>
      <UserProfileAddEmailView
        open
        onOpenChange={() => undefined}
        step='verify'
        emailAddress='person@example.com'
        onEmailAddressChange={() => undefined}
        code={code}
        onCodeChange={setCode}
        onSubmit={onSubmit}
        onResend={() => undefined}
      />
    </MosaicProvider>
  );
}

describe('UserProfileAddEmailView', () => {
  it.each(['', 'invalid-address'])('uses native email validation for %j', async emailAddress => {
    const user = userEvent.setup();
    const { props } = renderView({ emailAddress });
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInvalid();
  });

  it.each(['typing', 'pasting'] as const)('automatically submits a complete code after %s', async method => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VerificationExample onSubmit={onSubmit} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveFocus());

    if (method === 'typing') {
      await user.keyboard('12345');
      expect(onSubmit).not.toHaveBeenCalled();
      await user.keyboard('6');
    } else {
      await user.paste('123456');
    }

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it('focuses the email field and submits through the form or Send code', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    expect(screen.getByRole('dialog', { name: 'Add email' })).toBeInTheDocument();
    const email = screen.getByRole('textbox', { name: 'Email' });
    await waitFor(() => expect(email).toHaveFocus());
    const emailForm = email.closest('form');
    if (!emailForm) {
      throw new Error('Email form missing');
    }
    expect(emailForm).toHaveClass('cl-card-content');
    emailForm.requestSubmit();
    expect(props.onSubmit).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Send code' }));

    expect(props.onSubmit).toHaveBeenCalledTimes(2);
  });

  it('moves to verification inside the same dialog and submits the code', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView();
    const dialog = screen.getByRole('dialog');

    rerender(
      <MosaicProvider>
        <UserProfileAddEmailView
          {...props}
          step='verify'
          code='123456'
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('dialog', { name: 'Verify your email' })).toBe(dialog);
    expect(screen.getByText('Enter the code sent to person@example.com')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Email' })).not.toBeInTheDocument();
    const firstSlot = screen.getByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(firstSlot).toHaveFocus());
    const verifyForm = firstSlot.closest('form');
    if (!verifyForm) {
      throw new Error('Verification form missing');
    }
    expect(verifyForm).toHaveClass('cl-card-content');
    verifyForm.requestSubmit();
    expect(props.onSubmit).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Verify', exact: true }));

    expect(props.onSubmit).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('blocks submission and resend while verification is pending', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ step: 'verify', code: '123456', isPending: true });

    for (const slot of screen.getAllByRole('textbox')) {
      expect(slot).toBeDisabled();
    }
    const verify = screen.getByRole('button', { name: 'Verify', exact: true });
    expect(verify).toHaveAttribute('aria-busy', 'true');
    await user.click(verify);
    await user.click(screen.getByRole('button', { name: 'Didn’t receive a code? Resend' }));

    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(props.onResend).not.toHaveBeenCalled();
  });

  it.each(['email', 'verify'] as const)('associates a %s error with its input', step => {
    renderView({ step, errorMessage: 'Please try again.' });

    const field = screen.getByRole('textbox', { name: step === 'email' ? 'Email' : 'Verification code' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const describedControl = step === 'verify' ? screen.getByRole('group', { name: 'Verification code' }) : field;
    expect(describedControl).toHaveAccessibleDescription('Please try again.');
  });

  it('allows resending only after the countdown and the current request finish', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ step: 'verify', resendSeconds: 12 });
    await user.click(screen.getByRole('button', { name: 'Didn’t receive a code? Resend (12)' }));
    expect(props.onResend).not.toHaveBeenCalled();

    rerender(
      <MosaicProvider>
        <UserProfileAddEmailView
          {...props}
          resendSeconds={0}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Didn’t receive a code? Resend' }));
    expect(props.onResend).toHaveBeenCalledOnce();

    rerender(
      <MosaicProvider>
        <UserProfileAddEmailView
          {...props}
          resendSeconds={0}
          isResending
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('button', { name: 'Sending a new code…' })).toBeDisabled();
  });
});
