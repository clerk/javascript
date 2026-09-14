import { UserProfileConnectedAccountsSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-connected-accounts-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-connected-accounts-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileConnectedAccountsSection',
  label: 'Connected accounts',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-connected-accounts-section.view.tsx',
};

export function Default() {
  const [connected, setConnected] = useState(true);
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[
        {
          id: 'google',
          provider: 'Google',
          identifier: connected ? 'test@google.com' : undefined,
          iconUrl: 'https://img.clerk.com/static/google.svg',
          connected,
        },
        {
          id: 'apple',
          provider: 'Apple',
          iconUrl: 'https://img.clerk.com/static/apple.svg',
          connected: false,
        },
      ]}
      onConnect={() => undefined}
      onRemove={() => setConnected(false)}
    />
  );
}
