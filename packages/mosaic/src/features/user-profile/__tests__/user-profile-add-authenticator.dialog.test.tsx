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
    setup,
    onRetry: vi.fn(),
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
        setup={setup}
        onRetry={() => undefined}
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
  it.each([undefined, 'Unable to prepare your authenticator.'])(
    'allows cancellation during preparation: %s',
    async setupErrorMessage => {
      const user = userEvent.setup();
      const { props } = renderView({ setup: undefined, setupErrorMessage });
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
      expect(props.onRetry).not.toHaveBeenCalled();
      expect(props.onSubmit).not.toHaveBeenCalled();
    },
  );

  it('copies either manual credential through the caller and displays controlled copy feedback', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const { props, rerender } = renderView({ onCopy });
    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));
    const copyKey = screen.getByRole('button', { name: 'Copy setup key' });
    const copyUri = screen.getByRole('button', { name: 'Copy setup URI' });
    await user.click(copyKey);
    expect(onCopy).toHaveBeenCalledExactlyOnceWith(setup.secret);
    expect(props.onSubmit).not.toHaveBeenCalled();

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          copyStatus='pending'
        />
      </MosaicProvider>,
    );
    expect(copyKey).toHaveFocus();
    expect(copyKey).toHaveAttribute('aria-disabled', 'true');
    expect(copyUri).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('status', { name: 'Copy feedback' })).toHaveTextContent('Copying…');
    await user.click(copyUri);
    await user.keyboard('{Enter}');
    expect(onCopy).toHaveBeenCalledOnce();

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          copyErrorMessage='Could not copy. Please try again.'
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not copy. Please try again.');
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveValue(setup.secret);
    await user.click(copyUri);
    expect(onCopy).toHaveBeenLastCalledWith(setup.uri);

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          copyStatus='success'
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Copy feedback' })).toHaveTextContent('Copied');
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('shows preparation, offers retry on failure, and waits for setup data before verification', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ setup: undefined });
    const dialog = screen.getByRole('dialog', { name: 'Add an authenticator app' });
    expect(screen.getByRole('status', { name: 'Preparing authenticator…' })).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify', exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          setupErrorMessage='Unable to prepare your authenticator.'
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to prepare your authenticator.');
    expect(screen.queryByRole('status', { name: 'Preparing authenticator…' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).toHaveBeenCalledOnce();
    expect(props.onSubmit).not.toHaveBeenCalled();

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog {...props} />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Preparing authenticator…' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Preparing authenticator/ })).toHaveFocus();

    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          setup={setup}
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(screen.queryByRole('status', { name: 'Preparing authenticator…' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Verify', exact: true })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Verify', exact: true })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(props.onSubmit).not.toHaveBeenCalled();
    rerender(
      <MosaicProvider>
        <UserProfileAddAuthenticatorDialog
          {...props}
          setup={setup}
          code='123456'
        />
      </MosaicProvider>,
    );
    expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith('123456');
  });

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
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(props.onSubmit).toHaveBeenCalledTimes(2);
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
