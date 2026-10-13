import { UserProfileProfileSectionView } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-profile-section.view';
import type { FormError } from '@clerk/mosaic/utils/errors';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileProfileFixture } from './fixtures/user-profile-profile';

export { default as __source } from './user-profile-profile-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileProfileSection',
  label: 'Profile',
  navigation: { category: 'Sections' },
  source:
    'packages/mosaic/src/features/user-profile/user-profile-profile-section/user-profile-profile-section.view.tsx',
};

function ProfileSection(options: {
  nameFailWith?: FormError;
  usernameFailWith?: FormError;
  nameManagedBy?: { name: string };
}) {
  const profile = useUserProfileProfileFixture(options);

  return <UserProfileProfileSectionView {...profile} />;
}

export function Default() {
  return <ProfileSection />;
}

/**
 * An enterprise connection owns the name, so the row names who manages it in place of an edit
 * action.
 */
export function NameManagedByConnection() {
  return <ProfileSection nameManagedBy={{ name: 'Okta' }} />;
}

/** Every save is rejected, so the dialog shows both halves of a failure at once. */
export function EditNameFails() {
  return (
    <ProfileSection
      nameFailWith={{
        global: { code: 'internal_clerk_error', message: 'Your name could not be updated.' },
        fields: {
          lastName: { code: 'form_param_max_length_exceeded', message: 'Last name must be 64 characters or fewer.' },
        },
      }}
    />
  );
}

export function EditUsernameFails() {
  return (
    <ProfileSection
      usernameFailWith={{
        global: { code: 'internal_clerk_error', message: 'Your username could not be updated.' },
        fields: { username: { code: 'form_identifier_exists', message: 'That username is already taken.' } },
      }}
    />
  );
}
