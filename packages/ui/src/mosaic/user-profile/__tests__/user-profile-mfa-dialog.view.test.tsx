import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AlertDialog } from '../../components/alert-dialog';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileMfaAddFlowState } from '../dialogs/flow.types';
import { UserProfileMfaAddDialogView, UserProfileMfaRemoveDialogView } from '../user-profile-mfa-dialog.view';

const actions = {
  onAddPhone: vi.fn(),
  onSelectPhone: vi.fn(),
  onPhoneNumberChange: vi.fn(),
  onCodeChange: vi.fn(),
  onSubmit: vi.fn(),
  onResend: vi.fn(),
  onBack: vi.fn(),
  onToggleDisplayFormat: vi.fn(),
  onCopySecret: vi.fn(),
  onCopyBackupCodes: vi.fn(),
  onDownloadBackupCodes: vi.fn(),
  onPrintBackupCodes: vi.fn(),
  onFinish: vi.fn(),
};

function renderAdd(state: UserProfileMfaAddFlowState, overrides: Partial<typeof actions> = {}) {
  return render(
    <MosaicProvider>
      <MfaDialog>
        <UserProfileMfaAddDialogView
          state={state}
          onCancel={vi.fn()}
          {...actions}
          {...overrides}
        />
      </MfaDialog>
    </MosaicProvider>,
  );
}

describe('UserProfileMfaAddDialogView', () => {
  it('collects a phone number before verification', async () => {
    const onPhoneNumberChange = vi.fn();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderAdd(
      { method: 'sms', step: 'phone', phoneNumber: '+1', isSubmitting: false, errors: {} },
      { onPhoneNumberChange, onSubmit },
    );

    expect(screen.getByRole('dialog', { name: 'Add phone number' })).toHaveAccessibleDescription(
      "We'll send a verification code to this phone number.",
    );
    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '8015550100');
    expect(onPhoneNumberChange).toHaveBeenCalled();
  });

  it('offers existing phone numbers before adding another one', async () => {
    const onAddPhone = vi.fn();
    const onSelectPhone = vi.fn();
    const user = userEvent.setup();
    renderAdd(
      {
        method: 'sms',
        step: 'select-phone',
        phones: [{ id: 'phone', label: '+1 801-888-8181', isVerified: true }],
        isSubmitting: false,
        errors: {},
      },
      { onAddPhone, onSelectPhone },
    );

    await user.click(screen.getByRole('button', { name: '+1 801-888-8181' }));
    await user.click(screen.getByRole('button', { name: 'Add phone number' }));
    expect(onSelectPhone).toHaveBeenCalledWith('phone');
    expect(onAddPhone).toHaveBeenCalledOnce();
  });

  it('shows authenticator provisioning before setup is available', () => {
    renderAdd({ method: 'authenticator', step: 'preparing', isSubmitting: true, errors: {} });

    expect(screen.getByRole('status')).toHaveTextContent('Preparing authenticator setup');
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('shows both authenticator setup formats', async () => {
    const onToggleDisplayFormat = vi.fn();
    const user = userEvent.setup();
    renderAdd(
      {
        method: 'authenticator',
        step: 'setup',
        displayFormat: 'qr',
        secret: 'JBSWY3DPEHPK3PXP',
        uri: 'otpauth://totp/Clerk:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Clerk',
        isSubmitting: false,
        errors: {},
      },
      { onToggleDisplayFormat },
    );

    expect(screen.getByRole('img', { name: 'Authenticator QR code' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "Can't scan the QR code?" }));
    expect(onToggleDisplayFormat).toHaveBeenCalledOnce();
  });

  it('exposes the authenticator values as read-only inputs in manual setup', async () => {
    const onCopySecret = vi.fn();
    const user = userEvent.setup();
    renderAdd(
      {
        method: 'authenticator',
        step: 'setup',
        displayFormat: 'key',
        secret: 'JBSWY3DPEHPK3PXP',
        uri: 'otpauth://totp/Clerk:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Clerk',
        copied: false,
        isSubmitting: false,
        errors: {},
      },
      { onCopySecret },
    );

    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveValue('JBSWY3DPEHPK3PXP');
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: 'TOTP URI' })).toHaveValue(
      'otpauth://totp/Clerk:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Clerk',
    );
    expect(screen.getByRole('textbox', { name: 'TOTP URI' })).toHaveAttribute('readonly');
    await user.click(screen.getByRole('button', { name: 'Copy setup key' }));
    expect(onCopySecret).toHaveBeenCalledOnce();
  });

  it('shows SMS preparation and returns to the previous step', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    renderAdd(
      {
        method: 'sms',
        step: 'preparing-sms',
        identifier: '+1 801-888-8181',
        returnStep: 'select-phone',
        isSubmitting: false,
        errors: { form: 'Could not send a verification code.' },
      },
      { onBack },
    );

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('submits a verification code with a pending submit button', () => {
    renderAdd({
      method: 'authenticator',
      step: 'verify',
      code: '424242',
      status: 'verifying',
      resend: { isResending: false, secondsRemaining: 0 },
      isSubmitting: true,
      errors: {},
    });

    const dialog = screen.getByRole('dialog', { name: 'Add authenticator app' });
    expect(within(dialog).getByRole('button', { name: 'Verify' })).toHaveAttribute('aria-busy', 'true');
    expect(within(dialog).getByRole('progressbar', { name: 'Verifying code' })).toBeInTheDocument();
  });

  it('submits the completed code from the temporary OTP input', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const Harness = () => {
      const [code, setCode] = useState('');
      return (
        <MosaicProvider>
          <MfaDialog>
            <UserProfileMfaAddDialogView
              state={{
                method: 'authenticator',
                step: 'verify',
                code,
                status: 'idle',
                resend: { isResending: false, secondsRemaining: 0 },
                isSubmitting: false,
                errors: {},
              }}
              onCancel={vi.fn()}
              {...actions}
              onCodeChange={setCode}
              onSubmit={onSubmit}
            />
          </MfaDialog>
        </MosaicProvider>
      );
    };
    render(<Harness />);

    await user.type(screen.getByRole('textbox', { name: 'Verification code' }), '424242');
    expect(onSubmit).toHaveBeenCalledWith('424242');
  });

  it('shows system-generated backup codes after enrollment', async () => {
    const onCopyBackupCodes = vi.fn();
    const onFinish = vi.fn();
    const user = userEvent.setup();
    renderAdd(
      {
        method: 'authenticator',
        step: 'backup-codes',
        codes: ['3k4p-7m2q', '9w6d-2x8n'],
        copied: false,
        isSubmitting: false,
        errors: {},
      },
      { onCopyBackupCodes, onFinish },
    );

    expect(screen.getByText('3k4p-7m2q')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onCopyBackupCodes).toHaveBeenCalledOnce();
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe('UserProfileMfaRemoveDialogView', () => {
  it.each([
    ['sms' as const, '+1 801-888-8181', 'Remove phone number'],
    ['authenticator' as const, 'Authenticator app', 'Remove authenticator app'],
  ])('confirms removing %s', async (method, label, title) => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <AlertDialog open>
          <UserProfileMfaRemoveDialogView
            state={{ method, id: method, label, isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            onRemove={onRemove}
          />
        </AlertDialog>
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('alertdialog', { name: title });
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

function MfaDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root
      size='card'
      open
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
