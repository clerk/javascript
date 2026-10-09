import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import type { UserProfileDevice } from '../user-profile-active-devices-section/user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from '../user-profile-active-devices-section/user-profile-active-devices-section.view';
import type { UserProfileMfaSectionViewProps } from '../user-profile-mfa-section/user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '../user-profile-mfa-section/user-profile-mfa-section.view';
import { UserProfilePasskeysSectionView } from '../user-profile-passkeys-section.view';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

const devices: UserProfileDevice[] = [
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
];

const passkeys = [
  {
    id: 'passkey_1',
    name: 'Passkey',
    createdAtLabel: 'Created today at 10:12 PM',
    lastUsedAtLabel: 'Last used 1h ago',
  },
];

const mfaMethods: UserProfileMfaSectionViewProps['methods'] = [
  { id: 'sms_1', type: 'sms', description: '+1 801-888-8181' },
  { id: 'totp_1', type: 'authenticator' },
  { id: 'backup_1', type: 'backup-codes' },
];

function renderView(children: ReactNode) {
  return render(
    <MosaicProvider>
      <UserProfileSecurityPanelView>{children}</UserProfileSecurityPanelView>
    </MosaicProvider>,
  );
}

describe('UserProfileSecurityPanelView', () => {
  it('renders its sections in the order given', () => {
    renderView(
      <>
        <UserProfilePasskeysSectionView passkeys={passkeys} />
        <UserProfileMfaSectionView methods={mfaMethods} />
        <UserProfileActiveDevicesSectionView devices={devices} />
      </>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Security' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      'Passkeys',
      '2-step verification',
      'Active devices',
    ]);
    const activeDevices = screen.getByRole('group', { name: 'Active devices' });
    expect(within(activeDevices).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).not.toBeInTheDocument();
    expect(screen.getByText('This device')).toBeInTheDocument();
  });

  it('keeps the title when it has no sections', () => {
    renderView(null);

    expect(screen.getByRole('heading', { level: 2, name: 'Security' })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
  });

  it('adds an available MFA method through the picker', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    renderView(
      <UserProfileMfaSectionView
        methods={[
          { id: 'sms_1', type: 'sms', description: '+1 801-888-8181' },
          { id: 'backup_1', type: 'backup-codes' },
        ]}
        onAdd={onAdd}
        addableMethods={['authenticator']}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    expect(screen.queryByRole('button', { name: /SMS verification Get a code/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Authenticator app Get codes/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onAdd).toHaveBeenCalledWith('authenticator');
  });

  it('forwards security actions', async () => {
    const onSignOutDevice = vi.fn();
    const onSignOutAllOtherDevices = vi.fn();
    const user = userEvent.setup();

    renderView(
      <UserProfileActiveDevicesSectionView
        devices={devices}
        onSignOutDevice={onSignOutDevice}
        onSignOutAllOtherDevices={onSignOutAllOtherDevices}
      />,
    );

    const signOutAll = screen.getByRole('button', { name: 'Sign out of all devices' });
    expect(signOutAll).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('group', { name: 'Active devices' }).querySelector('.cl-section-header')).toContainElement(
      signOutAll,
    );
    await user.click(signOutAll);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    const activeDevices = screen.getByRole('group', { name: 'Active devices' });
    await user.click(within(activeDevices).getByRole('button', { name: 'Manage Safari on iOS' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    expect(onSignOutDevice).toHaveBeenCalledWith('mobile');
    expect(onSignOutAllOtherDevices).toHaveBeenCalledOnce();
  });

  it('keeps supported empty MFA methods and devices actionable', () => {
    renderView(
      <>
        <UserProfilePasskeysSectionView
          passkeys={[]}
          onAdd={vi.fn()}
        />
        <UserProfileMfaSectionView
          methods={[]}
          onAdd={vi.fn()}
          addableMethods={['sms', 'authenticator']}
        />
        <UserProfileActiveDevicesSectionView devices={[]} />
      </>,
    );

    expect(screen.getByText('No verification methods added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add verification method' })).toBeInTheDocument();
    expect(screen.getByText('No current device available')).toBeInTheDocument();
  });

  it('withholds sign out from the current device', async () => {
    const user = userEvent.setup();
    renderView(
      <UserProfileActiveDevicesSectionView
        devices={devices}
        onSignOutDevice={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Safari on macOS' }));
    expect(screen.getByRole('menuitem', { name: 'View details' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('keeps the passkeys card when passkeys are empty and Add is unavailable', () => {
    renderView(<UserProfilePasskeysSectionView passkeys={[]} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Passkeys' })).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
  });

  it('keeps the empty section and final passkey confirmation mounted without Add', async () => {
    const user = userEvent.setup();
    const removal = createDeferredPromise();
    const onRemovePasskey = vi.fn(async () => {
      await removal.promise;
    });
    const { rerender } = renderView(
      <UserProfilePasskeysSectionView
        passkeys={passkeys}
        onRemove={onRemovePasskey}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Passkey' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove passkey' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    rerender(
      <MosaicProvider>
        <UserProfileSecurityPanelView>
          <UserProfilePasskeysSectionView
            passkeys={[]}
            onRemove={onRemovePasskey}
          />
        </UserProfileSecurityPanelView>
      </MosaicProvider>,
    );
    expect(screen.getByRole('alertdialog', { name: 'Remove passkey' })).toBeVisible();

    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Passkeys' })).toBeVisible();
    expect(screen.getByText('No passkeys added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add passkey' })).not.toBeInTheDocument();
  });

  it('shows supplied backup codes independently and only allows regeneration', async () => {
    const onRegenerateBackupCodes = vi.fn();
    const onRemove = vi.fn();
    const backupCodes = { id: 'backup_1', type: 'backup-codes' as const };
    const backupOnlyView = renderView(
      <UserProfileMfaSectionView
        methods={[backupCodes]}
        onRegenerateBackupCodes={onRegenerateBackupCodes}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Backup codes')).toBeVisible();
    backupOnlyView.unmount();

    const user = userEvent.setup();
    renderView(
      <UserProfileMfaSectionView
        methods={[{ id: 'sms_1', type: 'sms' }, backupCodes]}
        onRegenerateBackupCodes={onRegenerateBackupCodes}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Backup codes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove SMS verification' });
    expect(dialog).toHaveAccessibleDescription(
      'This phone number will no longer receive sign-in verification codes. It will remain on your account.',
    );
    expect(onRemove).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    expect(screen.queryByRole('menuitem', { name: 'Remove method' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));

    expect(onRemove).toHaveBeenCalledWith('sms_1');
    expect(onRegenerateBackupCodes).toHaveBeenCalledOnce();
  });
});
