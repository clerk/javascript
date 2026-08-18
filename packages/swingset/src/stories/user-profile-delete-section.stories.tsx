import { UserProfileDeleteSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-delete-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileDeleteSection',
  source: 'packages/ui/src/mosaic/user-profile/user-profile-delete-section.view.tsx',
};

export function Default() {
  return <UserProfileDeleteSectionView onDelete={() => undefined} />;
}
