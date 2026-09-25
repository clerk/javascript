import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileVerifyEmailLinkDialogProps } from '../user-profile-account-section/user-profile-verify-email-link.dialog';
import { UserProfileVerifyEmailLinkDialog } from '../user-profile-account-section/user-profile-verify-email-link.dialog';

function renderView(overrides: Partial<UserProfileVerifyEmailLinkDialogProps> = {}) {
  const props: UserProfileVerifyEmailLinkDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    emailAddress: 'example@email.com',
    onResend: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileVerifyEmailLinkDialog {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('UserProfileVerifyEmailLinkDialog', () => {
  it('shows the address awaiting verification and lets the user resend the link', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    expect(screen.getByRole('dialog', { name: 'Verify email address' })).toHaveAccessibleDescription(
      'A verification link was sent to example@email.com',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Check your email');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Didn’t receive a link? Resend' }));
    expect(props.onResend).toHaveBeenCalledOnce();
  });

  it.each([
    { resendSeconds: 12, isResending: false, label: 'Didn’t receive a link? Resend (12)' },
    { resendSeconds: 0, isResending: true, label: 'Sending a new link…' },
  ])('prevents resending while $label', async ({ resendSeconds, isResending, label }) => {
    const user = userEvent.setup();
    const { props } = renderView({ resendSeconds, isResending });
    const resend = screen.getByRole('button', { name: label });

    expect(resend).toBeDisabled();
    await user.click(resend);
    expect(props.onResend).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces a supplied resend error and allows retry', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ errorMessage: 'Unable to send the verification link. Try again.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to send the verification link. Try again.');
    await user.click(screen.getByRole('button', { name: 'Didn’t receive a link? Resend' }));
    expect(props.onResend).toHaveBeenCalledOnce();
  });
});
