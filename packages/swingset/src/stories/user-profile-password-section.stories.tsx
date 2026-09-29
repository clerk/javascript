import { UserProfilePasswordSectionView } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view';
import type { UserProfileFormError } from '@clerk/mosaic/features/user-profile/user-profile-profile-panel.view';

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
    'packages/mosaic/src/features/user-profile/user-profile-password-section/user-profile-password-section.view.tsx',
};

function PasswordSection({
  hasPassword,
  requiresCurrentPassword,
  failWith,
}: {
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  failWith?: UserProfileFormError;
}) {
  const editPassword = useUserProfileEditPasswordFixture({ hasPassword, requiresCurrentPassword, failWith });

  return <UserProfilePasswordSectionView {...editPassword} />;
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

/**
 * An enterprise connection owns the password, so the row names who manages it in place of an edit
 * action and never opens the dialog.
 */
export function ManagedByEnterprise() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <UserProfilePasswordSectionView
        hasPassword
        managedBy={{ name: 'Okta' }}
      />
      <UserProfilePasswordSectionView
        hasPassword
        managedBy={{ name: 'Acme SSO' }}
      />
    </div>
  );
}

export function ManagedByEnterpriseLongName() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <UserProfilePasswordSectionView
        hasPassword
        managedBy={{
          name: 'Acme International Enterprise Identity and Access Management Production Organization',
          iconUrl: oktaIcon,
        }}
      />
    </div>
  );
}

/** The first save shows field and form errors; retrying succeeds. */
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
