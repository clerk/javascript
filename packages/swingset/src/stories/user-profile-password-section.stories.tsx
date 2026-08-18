import { UserProfilePasswordSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-password-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-password-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfilePasswordSection',
  label: 'Password',
  navigation: { family: 'User profile', category: 'Sections', order: 20 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-password-section.view.tsx',
};

export function Default() {
  return <UserProfilePasswordSectionView onChangePassword={() => undefined} />;
}
