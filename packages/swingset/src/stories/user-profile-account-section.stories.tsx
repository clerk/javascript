import { Button } from '@clerk/ui/mosaic/components/button';
import type { UserProfileFormError } from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.types';
import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-account-section/user-profile-account-section.view';
import { UserProfileVerifyEmailLinkView } from '@clerk/ui/mosaic/user-profile/user-profile-verify-email-link.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePreviewImage } from './fixtures/use-preview-image';
import { createUserProfileAddEmailFixture } from './fixtures/user-profile-add-email';
import { useUserProfileEditNameFixture } from './fixtures/user-profile-edit-name';
import { useUserProfileVerifyEmailLinkFixture } from './fixtures/user-profile-verify-email-link';

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
  failEmailVerification = false,
}: {
  allowMultipleAccounts: boolean;
  failWith?: UserProfileFormError;
  failEmailVerification?: boolean;
}) {
  const editName = useUserProfileEditNameFixture({ failWith });
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
  const emailFlow = createUserProfileAddEmailFixture({
    failAt: failEmailVerification ? 'verify' : undefined,
    onVerified: value => setEmails(current => [...current, { id: `email_${Date.now()}`, value, isVerified: true }]),
  });

  return (
    <UserProfileAccountSectionView
      {...editName}
      {...emailFlow}
      allowMultipleAccounts={allowMultipleAccounts}
      emails={emails}
      hasImage={Boolean(imageUrl)}
      imageUrl={imageUrl}
      phones={phones}
      username='prestonxyz'
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
      onSetPrimaryEmail={id => setEmails(current => current.map(email => ({ ...email, isDefault: email.id === id })))}
      onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
      onRemoveProfilePicture={clearImage}
      onUsernameChange={() => undefined}
    />
  );
}

export function Default() {
  return <AccountSection allowMultipleAccounts={false} />;
}

export function MultipleAccounts() {
  return <AccountSection allowMultipleAccounts />;
}

export function AddEmailFails() {
  return (
    <AccountSection
      allowMultipleAccounts
      failEmailVerification
    />
  );
}

export function EmailLinkVerification() {
  const fixture = useUserProfileVerifyEmailLinkFixture();
  return (
    <UserProfileVerifyEmailLinkView
      {...fixture}
      trigger={
        <Button
          variant='outline'
          color='neutral'
        >
          Verify email link
        </Button>
      }
    />
  );
}

export function EmailLinkResendFails() {
  const fixture = useUserProfileVerifyEmailLinkFixture({ failResend: true });
  return (
    <UserProfileVerifyEmailLinkView
      {...fixture}
      trigger={
        <Button
          variant='outline'
          color='neutral'
        >
          Verify email link
        </Button>
      }
    />
  );
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
