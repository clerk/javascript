import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileDeleteSectionView } from '../user-profile-delete-section/user-profile-delete-section.view';
import type { UserProfileSecurityPanelViewProps } from '../user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

function DeleteAccount({ onDelete = () => Promise.resolve() }: { onDelete?: () => Promise<void> }) {
  const controller = useDestructiveController({ onDelete });
  return <UserProfileDeleteSectionView {...controller} />;
}

const props: UserProfileSecurityPanelViewProps = {
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
  it('composes authentication, active devices, and the danger zone', () => {
    renderView({ deleteAccountSlot: <DeleteAccount /> });

    expect(screen.getByRole('heading', { level: 2, name: 'Security' })).toBeInTheDocument();
    const authentication = screen.getByRole('region', { name: 'Authentication' });
    expect(screen.queryByRole('heading', { name: 'Authentication' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Active devices' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Danger zone' })).toBeInTheDocument();
    expect(within(authentication).getByRole('heading', { level: 3, name: 'Passkeys' })).toBeInTheDocument();
    expect(within(authentication).getByRole('heading', { level: 3, name: '2-step verification' })).toBeInTheDocument();
    expect(within(authentication).getByRole('group', { name: 'Passkeys' })).toBeInTheDocument();
    expect(within(authentication).getByRole('group', { name: '2-step verification' })).toBeInTheDocument();
    const activeDevices = screen.getByRole('group', { name: 'Active devices' });
    expect(within(activeDevices).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).not.toBeInTheDocument();
    expect(screen.getByText('This device')).toBeInTheDocument();
    expect(
      screen.getByText('Permanently delete this account and all its data. This cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('adds an available MFA method through the picker', async () => {
    const onAddMfaMethod = vi.fn();
    const user = userEvent.setup();

    renderView({
      mfaMethods: [
        { id: 'sms_1', type: 'sms', description: '+1 801-888-8181' },
        { id: 'backup_1', type: 'backup-codes' },
      ],
      onAddMfaMethod,
      addableMfaMethods: ['authenticator'],
    });

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    expect(screen.queryByRole('button', { name: /SMS verification Get a code/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Authenticator app Get codes/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onAddMfaMethod).toHaveBeenCalledWith('authenticator');
  });

  it('forwards security actions', async () => {
    const onAddPasskey = vi.fn();
    const onRenamePasskey = vi.fn(() => Promise.resolve());
    const onRemovePasskey = vi.fn();
    const onSignOutDevice = vi.fn();
    const onSignOutAllOtherDevices = vi.fn();
    const onDeleteAccount = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();

    renderView({
      onAddPasskey,
      onRenamePasskey,
      onRemovePasskey,
      onSignOutDevice,
      onSignOutAllOtherDevices,
      deleteAccountSlot: <DeleteAccount onDelete={onDeleteAccount} />,
    });

    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    const signOutAll = screen.getByRole('button', { name: 'Sign out of all devices' });
    expect(signOutAll).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('group', { name: 'Active devices' }).querySelector('.cl-section-header')).toContainElement(
      signOutAll,
    );
    await user.click(signOutAll);
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

    const activeDevices = screen.getByRole('group', { name: 'Active devices' });
    await user.click(within(activeDevices).getByRole('button', { name: 'Manage Safari on iOS' }));
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
    expect(onSignOutDevice).toHaveBeenCalledWith('mobile');
    expect(onSignOutAllOtherDevices).toHaveBeenCalledOnce();
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });

  it('keeps supported empty authentication methods actionable', () => {
    renderView({
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
  });

  it('withholds sign out from the current device', async () => {
    const user = userEvent.setup();
    renderView({ onSignOutDevice: vi.fn() });

    await user.click(screen.getByRole('button', { name: 'Manage Safari on macOS' }));
    expect(screen.getByRole('menuitem', { name: 'View details' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('keeps the authentication section on MFA when existing passkeys are hidden', () => {
    renderView({
      passkeysVisible: false,
      onAddPasskey: vi.fn(),
      onRenamePasskey: vi.fn(),
      onRemovePasskey: vi.fn(),
    });

    expect(screen.queryByText('Passkeys')).not.toBeInTheDocument();
    expect(screen.queryByText('Passkey')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Authentication' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 3, name: '2-step verification' })).toBeVisible();
  });

  it('keeps the passkeys card in the authentication section when passkeys are empty and Add is unavailable', () => {
    renderView({ passkeys: [], onAddPasskey: undefined });

    const section = screen.getByRole('region', { name: 'Authentication' });
    expect(within(section).getByRole('heading', { level: 3, name: 'Passkeys' })).toBeVisible();
    expect(within(section).getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: '2-step verification' })).toBeVisible();
  });

  it('keeps the empty section and final passkey confirmation mounted without Add', async () => {
    const user = userEvent.setup();
    const removal = createDeferredPromise();
    const onRemovePasskey = vi.fn(async () => {
      await removal.promise;
    });
    const { rerender } = renderView({ mfaMethods: undefined, onRemovePasskey });

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
    expect(screen.getByRole('region', { name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('alertdialog', { name: 'Remove passkey' })).toBeVisible();

    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('region', { name: 'Authentication' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Passkeys' })).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
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
