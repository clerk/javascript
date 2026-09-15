import { UserProfilePasswordSectionView } from '@clerk/ui/mosaic/features/user-profile/user-profile-password-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-password-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfilePasswordSection',
  label: 'Password',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/features/user-profile/user-profile-password-section.view.tsx',
};

export function Default() {
  return <UserProfilePasswordSectionView onChangePassword={() => undefined} />;
}
