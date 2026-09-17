import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileSecurityPanelViewProps } from '../user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

const props: UserProfileSecurityPanelViewProps = {
  hasPassword: true,
  passkeys: [
    {
      id: 'passkey_1',
      name: 'Passkey',
      createdAtLabel: 'Created today at 10:12 PM',
      lastUsedAtLabel: 'Last used 1h ago',
    },
  ],
  mfaMethods: [
    { id: 'sms_1', type: 'sms', description: '+1 801-888-8181' },
    { id: 'totp_1', type: 'authenticator' },
    { id: 'backup_1', type: 'backup-codes' },
  ],
  devices: [
    {
      id: 'current',
      name: 'Safari on macOS',
      description: 'Salt Lake City, UT, United States',
      type: 'desktop',
      isCurrent: true,
    },
    {
      id: 'mobile',
      name: 'Safari on iOS',
      description: 'Last seen 2 weeks ago · Orem, UT, United States',
      type: 'mobile',
    },
    {
      id: 'desktop',
      name: 'Clerk App on macOS',
      description: 'Last seen May 14th, 2026 · San Francisco, CA, United States',
      type: 'desktop',
    },
  ],
};

function renderView(overrides: Partial<UserProfileSecurityPanelViewProps> = {}) {
  return render(
    <MosaicProvider>
      <UserProfileSecurityPanelView
        {...props}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

describe('UserProfileSecurityPanelView', () => {
  it('passes a shared MFA setup control into the section', async () => {
    const onOpen = vi.fn();
    renderView({
      mfaAddControl: (
        <button
          type='button'
          onClick={onOpen}
        >
          Set up MFA
        </button>
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Set up MFA' }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('composes authentication, active devices, and the danger zone', () => {
    renderView({ onDeleteAccount: vi.fn(() => Promise.resolve()) });

    expect(screen.getByRole('heading', { level: 3, name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Active devices' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeVisible();
    expect(screen.getByText('Passkeys')).toBeVisible();
    expect(screen.getByText('2-step verification')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Passkeys' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '2-step verification' })).toBeInTheDocument();
    expect(screen.getByText('This device')).toBeInTheDocument();
    expect(screen.getByText('2 other devices')).toBeInTheDocument();
    expect(
      screen.getByText('Permanently delete this account and all its data. This cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('forwards security actions', async () => {
    const onAddPasskey = vi.fn();
    const onRenamePasskey = vi.fn(() => Promise.resolve());
    const onRemovePasskey = vi.fn();
    const onAddMfaMethod = vi.fn();
    const onSignOutDevice = vi.fn();
    const onSignOutAllOtherDevices = vi.fn();
    const onDeleteAccount = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();

    renderView({
      mfaMethods: [
        { id: 'sms_1', type: 'sms', description: '+1 801-888-8181' },
        { id: 'backup_1', type: 'backup-codes' },
      ],
      onAddPasskey,
      onRenamePasskey,
      onRemovePasskey,
      onAddMfaMethod,
      addableMfaMethods: ['authenticator'],
      onSignOutDevice,
      onSignOutAllOtherDevices,
      onDeleteAccount,
    });

    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    expect(screen.queryByRole('button', { name: /SMS verification Get a code/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Authenticator app Get codes/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Manage Passkey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    const passkeyName = screen.getByRole('textbox', { name: 'Passkey name' });
    await user.clear(passkeyName);
    await user.type(passkeyName, 'Work laptop');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage Passkey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove', exact: true }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    const otherDevices = screen.getByRole('region', { name: 'Other devices' });
    await user.click(within(otherDevices).getByRole('button', { name: 'Manage Safari on iOS' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    // The danger zone confirms in a modal, so it goes last: nothing else is clickable while it is open.
    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    const deleteDialog = screen.getByRole('dialog');
    await user.type(within(deleteDialog).getByRole('textbox'), 'Delete account');
    await user.click(within(deleteDialog).getByRole('button', { name: 'Delete account' }));

    expect(onAddPasskey).toHaveBeenCalledOnce();
    expect(onRenamePasskey).toHaveBeenCalledWith('passkey_1', 'Work laptop');
    expect(onRemovePasskey).toHaveBeenCalledWith('passkey_1');
    expect(onAddMfaMethod).toHaveBeenCalledWith('authenticator');
    expect(onSignOutDevice).toHaveBeenCalledWith('mobile');
    expect(onSignOutAllOtherDevices).toHaveBeenCalledOnce();
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });

  it('keeps supported empty authentication methods actionable', () => {
    renderView({
      hasPassword: false,
      passkeys: [],
      mfaMethods: [],
      devices: [],
      onAddPasskey: vi.fn(),
      onAddMfaMethod: vi.fn(),
      addableMfaMethods: ['sms', 'authenticator'],
    });

    expect(screen.getByText('No passkeys added')).toBeInTheDocument();
    expect(screen.getByText('No verification methods added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add verification method' })).toBeInTheDocument();
    expect(screen.getByText('No current device available')).toBeInTheDocument();
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
  });

  it('withholds sign out from the current device', async () => {
    const user = userEvent.setup();
    renderView({ onSignOutDevice: vi.fn() });

    await user.click(screen.getByRole('button', { name: 'Manage Safari on macOS' }));
    expect(screen.getByRole('menuitem', { name: 'View details' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('keeps the authentication heading on MFA when existing passkeys are hidden', () => {
    renderView({
      hasPassword: false,
      passkeysVisible: false,
      onAddPasskey: vi.fn(),
      onRenamePasskey: vi.fn(),
      onRemovePasskey: vi.fn(),
    });

    expect(screen.queryByText('Passkeys')).not.toBeInTheDocument();
    expect(screen.queryByText('Passkey')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeVisible();
    expect(screen.getByText('2-step verification')).toBeVisible();
  });

  it('keeps one authentication heading when passkeys are empty and Add is unavailable', () => {
    renderView({ hasPassword: false, passkeys: [], onAddPasskey: undefined });

    const section = screen.getByRole('region', { name: 'Authentication' });
    expect(within(section).getByText('Passkeys')).toBeVisible();
    expect(within(section).getByText('No passkeys added')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '2-step verification' })).toBeVisible();
  });

  it('keeps the empty section and final passkey confirmation mounted without Add', async () => {
    const user = userEvent.setup();
    const removal = createDeferredPromise();
    const onRemovePasskey = vi.fn(async () => {
      await removal.promise;
    });
    const { rerender } = renderView({ hasPassword: false, mfaMethods: undefined, onRemovePasskey });

    await user.click(screen.getByRole('button', { name: 'Manage Passkey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    rerender(
      <MosaicProvider>
        <UserProfileSecurityPanelView
          passkeys={[]}
          onRemovePasskey={onRemovePasskey}
        />
      </MosaicProvider>,
    );
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog', { name: 'Remove passkey' })).toBeVisible();

    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeVisible();
    expect(screen.getByText('Passkeys')).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
  });

  it('forwards default changes and shows their errors in the MFA section', async () => {
    const user = userEvent.setup();
    const onSetDefaultMfaMethod = vi.fn(() => {
      throw new Error('Unable to change the default method.');
    });
    renderView({
      mfaMethods: [{ id: 'sms_1', type: 'sms', canSetDefault: true }],
      onSetDefaultMfaMethod,
    });

    await user.click(screen.getByRole('button', { name: 'Manage SMS verification' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));

    expect(onSetDefaultMfaMethod).toHaveBeenCalledExactlyOnceWith('sms_1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to change the default method.');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows supplied backup codes independently and only allows regeneration', async () => {
    const onRegenerateBackupCodes = vi.fn();
    const onRemoveMfaMethod = vi.fn();
    const backupCodes = { id: 'backup_1', type: 'backup-codes' as const };
    const backupOnlyView = renderView({
      mfaMethods: [backupCodes],
      onRegenerateBackupCodes,
      onRemoveMfaMethod,
    });

    expect(screen.getByText('Backup codes')).toBeVisible();
    backupOnlyView.unmount();

    const user = userEvent.setup();
    renderView({
      mfaMethods: [{ id: 'sms_1', type: 'sms' }, backupCodes],
      onRegenerateBackupCodes,
      onRemoveMfaMethod,
    });

    expect(screen.getByText('Backup codes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove SMS verification' });
    expect(dialog).toHaveAccessibleDescription(
      'This phone number will no longer receive sign-in verification codes. It will remain on your account.',
    );
    expect(onRemoveMfaMethod).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    expect(screen.queryByRole('menuitem', { name: 'Remove method' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));

    expect(onRemoveMfaMethod).toHaveBeenCalledWith('sms_1');
    expect(onRegenerateBackupCodes).toHaveBeenCalledOnce();
  });
});
