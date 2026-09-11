import type { UserProfileFormError } from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.types';
import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePreviewImage } from './fixtures/use-preview-image';
import { useUserProfileEditNameFixture } from './fixtures/user-profile-edit-name';
import { useUserProfileEditUsernameFixture } from './fixtures/user-profile-edit-username';

export { default as __source } from './user-profile-account-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileAccountSection',
  label: 'Account',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view.tsx',
};

function AccountSection({
  allowMultipleAccounts,
  failWith,
  usernameFailWith,
}: {
  allowMultipleAccounts: boolean;
  failWith?: UserProfileFormError;
  usernameFailWith?: UserProfileFormError;
}) {
  const editName = useUserProfileEditNameFixture({ failWith });
  const editUsername = useUserProfileEditUsernameFixture({ failWith: usernameFailWith });
  const [emails, setEmails] = useState<UserProfileEmail[]>(
    allowMultipleAccounts
      ? [
          { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
          { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
        ]
      : [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true }],
  );
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);
  const { imageUrl, showFile, clearImage } = usePreviewImage('https://avatars.githubusercontent.com/u/51144033?v=4');

  return (
    <UserProfileAccountSectionView
      {...editName}
      {...editUsername}
      allowMultipleAccounts={allowMultipleAccounts}
      emails={emails}
      hasImage={Boolean(imageUrl)}
      imageUrl={imageUrl}
      phones={phones}
      onAddEmail={() =>
        setEmails(current => [
          ...current,
          { id: `email_${Date.now()}`, value: `item${current.length + 1}@clerk.dev`, isVerified: true },
        ])
      }
      onAddPhone={() =>
        setPhones(current => [
          ...current,
          {
            id: `phone_${Date.now()}`,
            value: `+1 801-555-${String(current.length + 1).padStart(4, '0')}`,
            isVerified: true,
          },
        ])
      }
      onManageEmail={() => undefined}
      onManagePhone={() => undefined}
      onProfilePictureChange={showFile}
      onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
      onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
      onRemoveProfilePicture={clearImage}
    />
  );
}

export function Default() {
  return <AccountSection allowMultipleAccounts={false} />;
}

export function MultipleAccounts() {
  return <AccountSection allowMultipleAccounts />;
}

/** Every save is rejected, so the dialog shows both halves of a failure at once. */
export function EditNameFails() {
  return (
    <AccountSection
      allowMultipleAccounts={false}
      failWith={{
        message: 'Your name could not be updated.',
        fields: { lastName: 'Last name must be 64 characters or fewer.' },
      }}
    />
  );
}

/** Every username save is rejected, so the dialog shows a failure without losing what was typed. */
export function EditUsernameFails() {
  return (
    <AccountSection
      allowMultipleAccounts={false}
      usernameFailWith={{
        message: 'Your username could not be updated.',
        fields: { username: 'That username is already taken.' },
      }}
    />
  );
}
