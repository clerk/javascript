import type { UserProfilePasskey } from '@clerk/ui/mosaic/user-profile/user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-passkeys-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-passkeys-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasskeysSection',
  label: 'Passkeys',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-passkeys-section.view.tsx',
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

  return (
    <UserProfilePasskeysSectionView
      passkeys={passkeys}
      sectionTitle='Authentication'
      onAdd={() =>
        setPasskeys(current => [
          ...current,
          { id: `passkey-${Date.now()}`, name: `Passkey ${current.length + 1}`, createdAtLabel: 'Created just now' },
        ])
      }
      onManage={() => undefined}
      onRemove={id => setPasskeys(current => current.filter(passkey => passkey.id !== id))}
    />
  );
}

export function Empty() {
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>([]);

  return (
    <UserProfilePasskeysSectionView
      passkeys={passkeys}
      sectionTitle='Authentication'
      onAdd={() =>
        setPasskeys(current => [
          ...current,
          { id: `passkey-${Date.now()}`, name: `Passkey ${current.length + 1}`, createdAtLabel: 'Created just now' },
        ])
      }
      onRemove={id => setPasskeys(current => current.filter(passkey => passkey.id !== id))}
    />
  );
}
