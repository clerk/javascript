import { Button } from '@clerk/ui/mosaic/components/button';
import type { UserProfilePasswordMode } from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';

import type { StoryMeta } from '@/lib/types';

import { usePasswordDialogStory } from './helpers/use-password-dialog-story';

export { default as __source } from './user-profile-password-dialog.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasswordDialog',
  label: 'Password',
  navigation: { category: 'Dialogs' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-password-dialog.view.tsx',
};

function PasswordDialogStory({
  mode,
  withVerification = false,
}: {
  mode: UserProfilePasswordMode;
  withVerification?: boolean;
}) {
  const label = mode === 'set' ? 'Set password' : 'Change password';
  const { openPasswordDialog, passwordDialog } = usePasswordDialogStory({ mode, withVerification });

  return (
    <>
      <Button onClick={openPasswordDialog}>{label}</Button>
      {passwordDialog}
    </>
  );
}

export function Change() {
  return <PasswordDialogStory mode='change' />;
}

export function Set() {
  return <PasswordDialogStory mode='set' />;
}

export function Verification() {
  return (
    <PasswordDialogStory
      mode='change'
      withVerification
    />
  );
}
