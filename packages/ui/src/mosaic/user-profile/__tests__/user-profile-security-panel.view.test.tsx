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
    expect(screen.getByRole('menuitem', { name: 'Phone number' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Authenticator app' }));
    await user.click(screen.getByRole('button', { name: 'Sign out of all other devices' }));
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

  it('renders passkey creation progress and errors in the section', () => {
    const pending = renderView({
      passkeyCreationState: { capability: 'available', result: 'idle', isSubmitting: true, errors: {} },
      onAddPasskey: vi.fn(),
    });

    expect(screen.getByRole('button', { name: 'Add passkey' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Adding passkey' })).toBeInTheDocument();
    pending.unmount();

    renderView({
      passkeyCreationState: {
        capability: 'unsupported',
        result: 'idle',
        isSubmitting: false,
        errors: { form: 'Passkeys are not supported by this browser or device.' },
      },
      onAddPasskey: vi.fn(),
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Passkeys are not supported by this browser or device.');
    expect(screen.getByRole('button', { name: 'Add passkey' })).toBeDisabled();
  });

  it('only offers verification methods enabled by the instance', async () => {
    const user = userEvent.setup();
    renderView({
      mfaMethods: [],
      mfaAddableMethods: ['sms'],
      onAddMfaMethod: vi.fn(),
    });

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    expect(screen.getByRole('menuitem', { name: 'Phone number' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Authenticator app' })).not.toBeInTheDocument();
  });

  it('offers to set a password when password authentication is available', () => {
    renderView({
      hasPassword: false,
      passwordAvailable: true,
      passkeys: undefined,
      mfaMethods: undefined,
      onChangePassword: vi.fn(),
    });

    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeInTheDocument();
  });

  it('does not render actions for the current device', () => {
    renderView({
      onManageDevice: vi.fn(),
      onSignOutDevice: vi.fn(),
    });

    expect(screen.queryByRole('button', { name: 'Manage Safari on macOS' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Safari on iOS' })).toBeInTheDocument();
  });

  it('represents device loading, errors, session filtering, and impersonation relationships', () => {
    const loading = renderView({ devices: [], devicesStatus: 'loading' });
    expect(screen.getByRole('status', { name: 'Loading active devices' })).toBeInTheDocument();
    loading.unmount();

    const failed = renderView({ devices: [], devicesStatus: 'error', devicesError: 'Sessions are unavailable.' });
    expect(screen.getByText('Sessions are unavailable.')).toBeInTheDocument();
    failed.unmount();

    renderView({
      devices: [
        {
          id: 'current',
          name: 'Safari',
          type: 'desktop',
          isCurrent: true,
          relationship: 'current-impersonating',
          status: 'active',
        },
        {
          id: 'user',
          name: 'Chrome',
          type: 'desktop',
          relationship: 'user-device',
          status: 'pending',
        },
        {
          id: 'actor',
          name: 'Firefox',
          type: 'desktop',
          relationship: 'other-impersonator',
          status: 'active',
        },
        { id: 'ended', name: 'Ended session', type: 'mobile', status: 'ended' },
      ],
    });

    expect(screen.getByText('This device')).toBeInTheDocument();
    expect(screen.getByText('User device')).toBeInTheDocument();
    expect(screen.getByText('Other impersonator device')).toBeInTheDocument();
    expect(screen.queryByText('Ended session')).not.toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: 'Manage Phone number' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    expect(screen.queryByRole('menuitem', { name: 'Remove method' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate backup codes' }));

    expect(onRemoveMfaMethod).toHaveBeenCalledWith('sms_1');
    expect(onRegenerateBackupCodes).toHaveBeenCalledOnce();
  });

  it('offers legacy MFA actions for backup codes and the default phone', async () => {
    const onEnableBackupCodes = vi.fn();
    const onSetDefaultMfaMethod = vi.fn();
    const user = userEvent.setup();
    renderView({
      mfaMethods: [
        { id: 'sms_1', type: 'sms', description: '+1 801-888-8181', isDefault: true },
        { id: 'sms_2', type: 'sms', description: '+1 801-555-0100' },
      ],
      onEnableBackupCodes,
      onSetDefaultMfaMethod,
    });

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('menuitem', { name: 'Backup codes' }));
    await user.click(screen.getAllByRole('button', { name: 'Manage Phone number' }).at(-1)!);
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(onEnableBackupCodes).toHaveBeenCalledOnce();
    expect(onSetDefaultMfaMethod).toHaveBeenCalledWith('sms_2');
  });

  it('hides removal when a verification method is required', () => {
    renderView({
      mfaMethods: [{ id: 'sms_1', type: 'sms', removable: false }],
      onRemoveMfaMethod: vi.fn(),
    });

    expect(screen.queryByRole('button', { name: 'Manage Phone number' })).not.toBeInTheDocument();
  });
});
