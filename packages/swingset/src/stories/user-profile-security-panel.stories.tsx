import { UserProfileSecurityPanelView } from '@clerk/mosaic/features/user-profile/user-profile-security-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileFixture } from './fixtures/user-profile';

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
  const { pages } = useUserProfileFixture();
  return <UserProfileSecurityPanelView {...pages.security} />;
}
