import { Button } from '@clerk/ui/mosaic/components/button';

import type { StoryMeta } from '@/lib/types';

import { useSignOutAllDevicesDialogStory } from './helpers/use-sign-out-all-devices-dialog-story';

export { default as __source } from './user-profile-sign-out-all-devices-dialog.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileSignOutAllDevicesDialog',
  label: 'Sign out all devices',
  navigation: { category: 'Dialogs' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-sign-out-all-devices-dialog.view.tsx',
};

export function Default() {
  const { openSignOutAllDevicesDialog, signOutAllDevicesDialog } = useSignOutAllDevicesDialogStory();

  return (
    <>
      <Button onClick={openSignOutAllDevicesDialog}>Sign out of all devices</Button>
      {signOutAllDevicesDialog}
    </>
  );
}
