import { Button } from '@clerk/ui/mosaic/components/button';

import type { StoryMeta } from '@/lib/types';

import { useDeleteAccountDialogStory } from './helpers/use-delete-account-dialog-story';

export { default as __source } from './user-profile-delete-account-dialog.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileDeleteAccountDialog',
  label: 'Delete account',
  navigation: { category: 'Dialogs' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-delete-account-dialog.view.tsx',
};

export function Default() {
  const { openDeleteAccountDialog, deleteAccountDialog } = useDeleteAccountDialogStory();

  return (
    <>
      <Button
        color='negative'
        onClick={openDeleteAccountDialog}
      >
        Delete account
      </Button>
      {deleteAccountDialog}
    </>
  );
}
