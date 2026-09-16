import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileAddAuthenticatorDialogProps } from '../user-profile-add-authenticator.dialog';
import { UserProfileAddAuthenticatorDialog } from '../user-profile-add-authenticator.dialog';

const setup = {
  secret: 'JBSWY3DPEHPK3PXP',
  uri: 'otpauth://totp/Swingset:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Swingset',
};

function renderView(overrides: Partial<UserProfileAddAuthenticatorDialogProps> = {}) {
  const props: UserProfileAddAuthenticatorDialogProps = {
    ...setup,
    open: true,
    onOpenChange: vi.fn(),
    code: '',
    onCodeChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog {...props} />
      </MosaicProvider>,
    ),
  };
}

function VerificationExample({ onSubmit }: Pick<UserProfileAddAuthenticatorDialogProps, 'onSubmit'>) {
  const [code, setCode] = useState('');
  return (
    <MosaicProvider>
      <UserProfileAddAuthenticatorDialog
        {...setup}
        open
        onOpenChange={() => undefined}
        code={code}
        onCodeChange={setCode}
        onSubmit={onSubmit}
      />
    </MosaicProvider>
  );
}

describe('UserProfileAddAuthenticatorDialog', () => {
  it.each(['typing', 'pasting'] as const)('submits a complete authenticator code after %s', async method => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VerificationExample onSubmit={onSubmit} />);
    const dialog = screen.getByRole('dialog', { name: 'Add an authenticator app' });
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Resend/ })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close', exact: true })).toHaveFocus());
    await user.click(screen.getByRole('textbox', { name: 'Verification code' }));

    if (method === 'typing') {
      await user.keyboard('12345');
      expect(onSubmit).not.toHaveBeenCalled();
      await user.keyboard('6');
    } else {
      await user.paste('123456');
    }

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('123456');
    expect(screen.getByRole('dialog')).toBe(dialog);
  });

  it('submits the current code through Verify or the form and does not submit on Cancel', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ code: '654321' });
    await user.click(screen.getByRole('button', { name: 'Verify', exact: true }));
    expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith('654321');

    const form = screen.getByRole('textbox', { name: 'Verification code' }).closest('form');
    if (!form) {
      throw new Error('Verification form missing');
    }
    form.requestSubmit();
    expect(props.onSubmit).toHaveBeenCalledTimes(2);
    expect(props.onSubmit).toHaveBeenLastCalledWith('654321');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(props.onSubmit).toHaveBeenCalledTimes(2);
  });

  it('blocks incomplete and pending submissions, including native form submission', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ code: '123' });
    const verify = screen.getByRole('button', { name: 'Verify', exact: true });
    expect(verify).toBeDisabled();
    await user.click(screen.getByRole('textbox', { name: 'Verification code' }));
    await user.keyboard('{Enter}');
    expect(props.onSubmit).not.toHaveBeenCalled();

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          code='123456'
          isPending
        />
      </MosaicProvider>,
    );
    expect(verify).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Verifying code' })).toBeInTheDocument();
    for (const slot of screen.getAllByRole('textbox')) {
      expect(slot).toBeDisabled();
    }
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.click(verify);
    const form = screen.getByRole('textbox', { name: 'Verification code' }).closest('form');
    if (!form) {
      throw new Error('Verification form missing');
    }
    form.requestSubmit();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('preserves the setup mode and code on failure, then clears feedback when retry begins', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ code: '123456' });
    const dialog = screen.getByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          errorMessage='That code has expired. Please try again.'
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveValue(setup.secret);
    expect(screen.getByRole('textbox', { name: 'Setup URI' })).toHaveValue(setup.uri);
    const group = screen.getByRole('group', { name: 'Verification code' });
    expect(group).toHaveAccessibleDescription('That code has expired. Please try again.');
    expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Verify', exact: true }));
    expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith('123456');

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          isPending
        />
      </MosaicProvider>,
    );
    expect(group).not.toHaveAccessibleDescription();
    expect(screen.getByRole('textbox', { name: 'Verification code' })).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveValue(setup.secret);
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
