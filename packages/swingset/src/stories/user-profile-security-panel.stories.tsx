import type {
  UserProfileMfaMethod,
  UserProfilePasskey,
} from '@clerk/mosaic/features/user-profile/user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/mosaic/features/user-profile/user-profile-security-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileActiveDevicesFixture } from './fixtures/user-profile-active-devices';
import { useUserProfileEditPasswordFixture } from './fixtures/user-profile-edit-password';

export { default as __source } from './user-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileSecurityPanel',
  label: 'Security panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-security-panel.view.tsx',
};

export function Default() {
  const editPassword = useUserProfileEditPasswordFixture();
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>([
    {
      id: 'passkey',
      name: 'Passkey',
      createdAtLabel: 'Created today at 10:12 PM',
      lastUsedAtLabel: 'Last used 1h ago',
    },
  ]);
  const [mfaMethods, setMfaMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'sms', type: 'sms', description: '+1 801-888-8181' },
    { id: 'backup', type: 'backup-codes' },
  ]);
  const devices = useUserProfileActiveDevicesFixture();

  return (
    <UserProfileSecurityPanelView
      {...editPassword}
      devices={devices.devices}
      mfaMethods={mfaMethods}
      passkeys={passkeys}
      onAddMfaMethod={type =>
        setMfaMethods(current => {
          const timestamp = Date.now();
          return [
            ...current,
            {
              id: `${type}-${timestamp}`,
              type,
              description: type === 'sms' ? '+1 801-555-0100' : undefined,
            },
            ...(current.some(method => method.type === 'backup-codes')
              ? []
              : [{ id: `backup-${timestamp}`, type: 'backup-codes' as const }]),
          ];
        })
      }
      onAddPasskey={() =>
        setPasskeys(current => [
          ...current,
          { id: `passkey-${Date.now()}`, name: `Passkey ${current.length + 1}`, createdAtLabel: 'Created just now' },
        ])
      }
      onDeleteAccount={() => Promise.resolve()}
      onManagePasskey={() => undefined}
      onRegenerateBackupCodes={() =>
        setMfaMethods(current =>
          current.map(method => (method.type === 'backup-codes' ? { ...method, description: 'Just now' } : method)),
        )
      }
      onRemoveMfaMethod={id => setMfaMethods(current => current.filter(method => method.id !== id))}
      onRemovePasskey={id => setPasskeys(current => current.filter(passkey => passkey.id !== id))}
      onSignOutAllOtherDevices={devices.onSignOutAllOtherDevices}
      onSignOutDevice={devices.onSignOutDevice}
    />
  );
}
