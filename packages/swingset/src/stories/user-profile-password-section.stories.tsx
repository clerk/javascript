import type { UserProfileFormError } from '@clerk/ui/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import { UserProfilePasswordSectionView } from '@clerk/ui/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileEditPasswordFixture } from './fixtures/user-profile-edit-password';

export { default as __source } from './user-profile-password-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfilePasswordSection',
  label: 'Password',
  navigation: { category: 'Sections' },
  source:
    'packages/ui/src/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view.tsx',
};

function PasswordSection({
  hasPassword,
  requiresCurrentPassword,
  isReadOnly,
  failWith,
}: {
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  isReadOnly?: boolean;
  failWith?: UserProfileFormError;
}) {
  const editPassword = useUserProfileEditPasswordFixture({ hasPassword, requiresCurrentPassword, failWith });

  return (
    <UserProfilePasswordSectionView
      {...editPassword}
      isReadOnly={isReadOnly}
    />
  );
}

export function Default() {
  return <PasswordSection />;
}

/** The account has no password yet, so the row sets one instead of changing one. */
export function SetPassword() {
  return <PasswordSection hasPassword={false} />;
}

/** Reverification already proved the user, so the dialog skips asking for the current password. */
export function WithoutCurrentPassword() {
  return <PasswordSection requiresCurrentPassword={false} />;
}

/** The account signs in only through an enterprise connection: the dialog opens to say so, and nothing else. */
export function ReadOnly() {
  return <PasswordSection isReadOnly />;
}

/** Every save is rejected, so the dialog shows both halves of a failure at once. */
export function EditPasswordFails() {
  return (
    <PasswordSection
      failWith={{
        message: 'Your password could not be updated.',
        fields: { currentPassword: 'Incorrect password.' },
      }}
    />
  );
}
