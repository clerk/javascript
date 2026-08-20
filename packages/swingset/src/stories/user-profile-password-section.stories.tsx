import { UserProfilePasswordSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-password-section.view';

import type { StoryMeta } from '@/lib/types';

import { usePasswordDialogStory } from './helpers/use-password-dialog-story';

export { default as __source } from './user-profile-password-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasswordSection',
  label: 'Password',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-password-section.view.tsx',
};

export function Default() {
  const { openPasswordDialog, passwordDialog } = usePasswordDialogStory();

  return (
    <>
      <UserProfilePasswordSectionView onChangePassword={openPasswordDialog} />
      {passwordDialog}
    </>
  );
}
