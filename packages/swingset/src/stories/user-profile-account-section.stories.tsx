import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/ui/mosaic/user-profile/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-account-section.view';
import type { UserProfileAddPhoneViewProps } from '@clerk/ui/mosaic/user-profile/user-profile-add-phone.view';
import { UserProfileAddPhoneView } from '@clerk/ui/mosaic/user-profile/user-profile-add-phone.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePreviewImage } from './fixtures/use-preview-image';
import { useUserProfileAddPhoneFixture } from './fixtures/user-profile-add-phone';

export { default as __source } from './user-profile-account-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileAccountSection',
  label: 'Account',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-account-section.view.tsx',
};

function AccountSection({
  allowMultipleAccounts,
  failAt,
}: {
  allowMultipleAccounts: boolean;
  failAt?: UserProfileAddPhoneViewProps['step'];
}) {
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
  const addPhone = useUserProfileAddPhoneFixture({
    failAt,
    onVerified: value => setPhones(current => [...current, { id: `phone_${Date.now()}`, value, isVerified: true }]),
  });

  return (
    <>
      <UserProfileAccountSectionView
        allowMultipleAccounts={allowMultipleAccounts}
        emails={emails}
        hasImage={Boolean(imageUrl)}
        imageUrl={imageUrl}
        name='Preston Booth'
        phones={phones}
        username='prestonxyz'
        onAddEmail={() =>
          setEmails(current => [
            ...current,
            { id: `email_${Date.now()}`, value: `item${current.length + 1}@clerk.dev`, isVerified: true },
          ])
        }
        onAddPhone={() => addPhone.onOpenChange(true)}
        onProfilePictureChange={showFile}
        onRemoveProfilePicture={clearImage}
        onManageEmail={() => undefined}
        onManagePhone={() => undefined}
        onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
        onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
        onNameChange={() => undefined}
        onUsernameChange={() => undefined}
      />
      <UserProfileAddPhoneView {...addPhone} />
    </>
  );
}

export function Default() {
  return <AccountSection allowMultipleAccounts={false} />;
}

export function MultipleAccounts() {
  return <AccountSection allowMultipleAccounts />;
}

export function AddPhoneFails() {
  return (
    <AccountSection
      allowMultipleAccounts
      failAt='phone'
    />
  );
}
