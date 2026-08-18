import { UserProfileConnectedAccountsSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-connected-accounts-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-connected-accounts-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileConnectedAccountsSection',
  source: 'packages/ui/src/mosaic/user-profile/user-profile-connected-accounts-section.view.tsx',
};

export function Default() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[
        {
          id: 'google',
          provider: 'Google',
          identifier: 'test@google.com',
          iconUrl: 'https://img.clerk.com/static/google.svg',
          connected: true,
        },
        {
          id: 'apple',
          provider: 'Apple',
          iconUrl: 'https://img.clerk.com/static/apple.svg',
          connected: false,
        },
      ]}
      onConnect={() => undefined}
      onManage={() => undefined}
    />
  );
}
