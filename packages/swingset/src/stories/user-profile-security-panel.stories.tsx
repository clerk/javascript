import type {
  UserProfileDevice,
  UserProfileMfaMethod,
  UserProfilePasskey,
} from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useBackupCodesDialogStory } from './helpers/use-backup-codes-dialog-story';
import { useDeleteAccountDialogStory } from './helpers/use-delete-account-dialog-story';
import { useDeviceDialogStory } from './helpers/use-device-dialog-story';
import { useMfaDialogStory } from './helpers/use-mfa-dialog-story';
import { usePasskeyDialogStory } from './helpers/use-passkey-dialog-story';
import { usePasswordDialogStory } from './helpers/use-password-dialog-story';
import { useSignOutAllDevicesDialogStory } from './helpers/use-sign-out-all-devices-dialog-story';

export { default as __source } from './user-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileSecurityPanel',
  label: 'Security panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-security-panel.view.tsx',
};

export function Default() {
  const { openBackupCodesDialog, backupCodesDialog } = useBackupCodesDialogStory();
  const { openDeleteAccountDialog, deleteAccountDialog } = useDeleteAccountDialogStory();
  const { openPasswordDialog, passwordDialog } = usePasswordDialogStory();
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>([
    {
      id: 'passkey',
      name: 'Passkey',
      createdAtLabel: 'Created today at 10:12 PM',
      lastUsedAtLabel: 'Last used 1h ago',
    },
  ]);
  const { addPasskey, openRenamePasskeyDialog, openRemovePasskeyDialog, passkeyDialogs } = usePasskeyDialogStory({
    passkeys,
    onChange: setPasskeys,
  });
  const [mfaMethods, setMfaMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'sms', type: 'sms', description: '+1 801-888-8181' },
    { id: 'backup-codes', type: 'backup-codes' },
  ]);
  const { openAddMfaDialog, openRemoveMfaDialog, mfaDialogs } = useMfaDialogStory({
    methods: mfaMethods,
    onChange: setMfaMethods,
  });
  const [devices, setDevices] = useState<UserProfileDevice[]>([
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
      details: {
        title: 'Macbook Pro · Chrome',
        lastActiveAtLabel: 'Last active 4 days ago',
        deviceName: 'Macbook Pro',
        browserName: 'Chrome 150.0.0.0',
        ipAddress: '2600:100e:b10b:787b:e8ae:6e75:fc2f:b10',
        location: 'Salt Lake City, UT, United States',
        locationFlag: '🇺🇸',
        originalSignInAtLabel: 'July 5th, 2026',
      },
    },
  ]);
  const { openSignOutAllDevicesDialog, signOutAllDevicesDialog } = useSignOutAllDevicesDialogStory({
    onSignOut: () => setDevices(current => current.filter(device => device.isCurrent)),
  });
  const { openDeviceDialog, deviceDialog } = useDeviceDialogStory({
    onSignOut: id => setDevices(current => current.filter(device => device.id !== id)),
  });
  const openDevice = (id: string) => {
    const device = devices.find(candidate => candidate.id === id);
    if (!device) {
      return;
    }
    openDeviceDialog({
      id,
      title: device.details?.title ?? device.name,
      lastActiveAtLabel: device.details?.lastActiveAtLabel ?? device.description ?? 'Active now',
      deviceName: device.details?.deviceName ?? device.name,
      browserName: device.details?.browserName ?? 'Unknown',
      ipAddress: device.details?.ipAddress ?? 'Unknown',
      location: device.details?.location ?? 'Unknown',
      locationFlag: device.details?.locationFlag,
      originalSignInAtLabel: device.details?.originalSignInAtLabel ?? 'Unknown',
    });
  };

  return (
    <>
      <UserProfileSecurityPanelView
        devices={devices}
        hasPassword
        mfaMethods={mfaMethods}
        passkeys={passkeys}
        onAddMfaMethod={openAddMfaDialog}
        onAddPasskey={addPasskey}
        onChangePassword={openPasswordDialog}
        onDeleteAccount={openDeleteAccountDialog}
        onManageDevice={openDevice}
        onManagePasskey={openRenamePasskeyDialog}
        onRemoveMfaMethod={openRemoveMfaDialog}
        onRemovePasskey={openRemovePasskeyDialog}
        onRegenerateBackupCodes={openBackupCodesDialog}
        onSignOutAllOtherDevices={openSignOutAllDevicesDialog}
        onSignOutDevice={openDevice}
      />
      {passwordDialog}
      {deleteAccountDialog}
      {signOutAllDevicesDialog}
      {deviceDialog}
      {mfaDialogs}
      {passkeyDialogs}
      {backupCodesDialog}
    </>
  );
}
