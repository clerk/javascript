import { UserProfileDeleteSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-section.view';

import type { StoryMeta } from '@/lib/types';

import { useDeleteAccountDialogStory } from './helpers/use-delete-account-dialog-story';

export { default as __source } from './user-profile-delete-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileDeleteSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-delete-section.view.tsx',
};

export function Default() {
  const { openDeleteAccountDialog, deleteAccountDialog } = useDeleteAccountDialogStory();

  return (
    <>
      <UserProfileDeleteSectionView onDelete={openDeleteAccountDialog} />
      {deleteAccountDialog}
    </>
  );
}
