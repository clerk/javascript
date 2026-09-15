import { Button } from '@clerk/mosaic/components/button';
import type { UserProfileFormError } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.view';
import type { UserProfileAddPhoneDialogProps } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-add-phone.dialog';
import { UserProfileVerifyEmailLinkDialog } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-verify-email-link.dialog';
import { UserProfileVerifyEmailSsoDialog } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-verify-email-sso.dialog';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePreviewImage } from './fixtures/use-preview-image';
import { createUserProfileAddEmailFixture } from './fixtures/user-profile-add-email';
import { createUserProfileAddPhoneFixture } from './fixtures/user-profile-add-phone';
import { useUserProfileEditNameFixture } from './fixtures/user-profile-edit-name';
import { useUserProfileEditUsernameFixture } from './fixtures/user-profile-edit-username';
import { useUserProfileVerifyEmailLinkFixture } from './fixtures/user-profile-verify-email-link';
import { useUserProfileVerifyEmailSsoFixture } from './fixtures/user-profile-verify-email-sso';

export { default as __source } from './user-profile-account-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileAccountSection',
  label: 'Account',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-account-section/user-profile-account-section.view.tsx',
};

function AccountSection({
  allowMultipleAccounts,
  failAt,
  failWith,
  usernameFailWith,
  failEmailVerification = false,
}: {
  allowMultipleAccounts: boolean;
  failAt?: UserProfileAddPhoneDialogProps['step'];
  failWith?: UserProfileFormError;
  usernameFailWith?: UserProfileFormError;
  failEmailVerification?: boolean;
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
    ...(allowMultipleAccounts ? [{ id: 'phone_2', value: '+18015550100', isVerified: true }] : []),
  ]);
  const { imageUrl, showFile, clearImage } = usePreviewImage('https://avatars.githubusercontent.com/u/51144033?v=4');
  const addPhone = createUserProfileAddPhoneFixture({
    failAt,
    onVerified: value => setPhones(current => [...current, { id: `phone_${Date.now()}`, value, isVerified: true }]),
  });
  const emailFlow = createUserProfileAddEmailFixture({
    failAt: failEmailVerification ? 'verify' : undefined,
    onVerified: value => setEmails(current => [...current, { id: `email_${Date.now()}`, value, isVerified: true }]),
  });

  return (
    <UserProfileAccountSectionView
      {...editName}
      {...editUsername}
      {...emailFlow}
      allowMultipleAccounts={allowMultipleAccounts}
      emails={emails}
      hasImage={Boolean(imageUrl)}
      imageUrl={imageUrl}
      phones={phones}
      {...addPhone}
      onProfilePictureChange={showFile}
      onRemoveProfilePicture={clearImage}
      onManageEmail={() => undefined}
      onManagePhone={() => undefined}
      onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
      onSetPrimaryEmail={id => setEmails(current => current.map(email => ({ ...email, isDefault: email.id === id })))}
      onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
      onSetPrimaryPhone={id => setPhones(current => current.map(phone => ({ ...phone, isDefault: phone.id === id })))}
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
    <UserProfileVerifyEmailLinkDialog
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
    <UserProfileVerifyEmailLinkDialog
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

export function EmailSsoVerification() {
  const fixture = useUserProfileVerifyEmailSsoFixture();
  return (
    <UserProfileVerifyEmailSsoDialog
      {...fixture}
      trigger={
        <Button
          variant='outline'
          color='neutral'
        >
          Verify with SSO
        </Button>
      }
    />
  );
}

export function EmailSsoConnectFails() {
  const fixture = useUserProfileVerifyEmailSsoFixture({ failConnect: true });
  return (
    <UserProfileVerifyEmailSsoDialog
      {...fixture}
      trigger={
        <Button
          variant='outline'
          color='neutral'
        >
          Verify with SSO
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

export function AddPhoneFails() {
  return (
    <AccountSection
      allowMultipleAccounts
      failAt='phone'
    />
  );
}
