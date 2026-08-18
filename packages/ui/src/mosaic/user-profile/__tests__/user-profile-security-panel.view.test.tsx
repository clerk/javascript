import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
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
  it('composes authentication, active devices, and the danger zone', () => {
    renderView({ onDeleteAccount: vi.fn() });

    expect(screen.getByRole('heading', { level: 3, name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Active devices' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Password')).toHaveClass('cl-section-label');
    expect(screen.getByText('Passkeys')).toHaveClass('cl-section-label');
    expect(screen.getByText('2-step verification')).toHaveClass('cl-section-label');
    expect(screen.getByRole('region', { name: 'Passkeys' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '2-step verification' })).toBeInTheDocument();
    expect(screen.getByText('This device')).toBeInTheDocument();
    expect(screen.getByText('2 other devices')).toBeInTheDocument();
    expect(
      screen.getByText('Permanently delete this account and all its data. This cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('forwards security actions', async () => {
    const onChangePassword = vi.fn();
    const onAddPasskey = vi.fn();
    const onManagePasskey = vi.fn();
    const onRemovePasskey = vi.fn();
    const onAddMfaMethod = vi.fn();
    const onSignOutDevice = vi.fn();
    const onSignOutAllOtherDevices = vi.fn();
    const onDeleteAccount = vi.fn();
    const user = userEvent.setup();

    renderView({
      mfaMethods: [
        { id: 'sms_1', type: 'sms', description: '+1 801-888-8181' },
        { id: 'backup_1', type: 'backup-codes' },
      ],
      onChangePassword,
      onAddPasskey,
      onManagePasskey,
      onRemovePasskey,
      onAddMfaMethod,
      onSignOutDevice,
      onSignOutAllOtherDevices,
      onDeleteAccount,
    });

    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    expect(screen.queryByRole('menuitem', { name: 'SMS verification' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Authenticator app' }));
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    await user.click(screen.getByRole('button', { name: 'Manage Passkey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await user.click(screen.getByRole('button', { name: 'Manage Passkey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));

    const otherDevices = screen.getByRole('region', { name: 'Other devices' });
    await user.click(within(otherDevices).getByRole('button', { name: 'Manage Safari on iOS' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(onChangePassword).toHaveBeenCalledOnce();
    expect(onAddPasskey).toHaveBeenCalledOnce();
    expect(onManagePasskey).toHaveBeenCalledWith('passkey_1');
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
    });

    expect(screen.getByText('No passkeys added')).toBeInTheDocument();
    expect(screen.getByText('No verification methods added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add verification method' })).toBeInTheDocument();
    expect(screen.getByText('No current device available')).toBeInTheDocument();
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
  });

  it('does not render actions for the current device', () => {
    renderView({
      onManageDevice: vi.fn(),
      onSignOutDevice: vi.fn(),
    });

    expect(screen.queryByRole('button', { name: 'Manage Safari on macOS' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Safari on iOS' })).toBeInTheDocument();
  });

  it('only shows backup codes with another verification method and only allows regeneration', async () => {
    const onRegenerateBackupCodes = vi.fn();
    const onRemoveMfaMethod = vi.fn();
    const backupCodes = { id: 'backup_1', type: 'backup-codes' as const };
    const backupOnlyView = renderView({
      mfaMethods: [backupCodes],
      onRegenerateBackupCodes,
      onRemoveMfaMethod,
    });

    expect(screen.queryByText('Backup codes')).not.toBeInTheDocument();
    backupOnlyView.unmount();

    const user = userEvent.setup();
    renderView({
      mfaMethods: [{ id: 'sms_1', type: 'sms' }, backupCodes],
      onRegenerateBackupCodes,
      onRemoveMfaMethod,
    });

    expect(screen.getByText('Backup codes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    expect(screen.queryByRole('menuitem', { name: 'Remove method' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));

    expect(onRegenerateBackupCodes).toHaveBeenCalledOnce();
    expect(onRemoveMfaMethod).not.toHaveBeenCalled();
  });
});
