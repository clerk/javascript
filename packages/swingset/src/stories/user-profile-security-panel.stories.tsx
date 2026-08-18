import type {
  UserProfileDevice,
  UserProfileMfaMethod,
  UserProfilePasskey,
} from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileSecurityPanel',
  label: 'Security panel',
  navigation: { family: 'User profile', category: 'Compositions', order: 20 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-security-panel.view.tsx',
};

export function Default() {
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
    },
  ]);

  return (
    <UserProfileSecurityPanelView
      devices={devices}
      hasPassword
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
      onChangePassword={() => undefined}
      onDeleteAccount={() => undefined}
      onManageDevice={() => undefined}
      onManagePasskey={() => undefined}
      onRegenerateBackupCodes={() =>
        setMfaMethods(current =>
          current.map(method => (method.type === 'backup-codes' ? { ...method, description: 'Just now' } : method)),
        )
      }
      onRemoveMfaMethod={id => setMfaMethods(current => current.filter(method => method.id !== id))}
      onRemovePasskey={id => setPasskeys(current => current.filter(passkey => passkey.id !== id))}
      onSignOutAllOtherDevices={() => setDevices(current => current.filter(device => device.isCurrent))}
      onSignOutDevice={id => setDevices(current => current.filter(device => device.id !== id))}
    />
  );
}
