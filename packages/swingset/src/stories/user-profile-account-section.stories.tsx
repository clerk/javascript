import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/ui/mosaic/user-profile/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-account-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-account-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileAccountSection',
  source: 'packages/ui/src/mosaic/user-profile/user-profile-account-section.view.tsx',
};

export function Default() {
  const [emails, setEmails] = useState<UserProfileEmail[]>([
    { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
  ]);
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);

  return (
    <UserProfileAccountSectionView
      emails={emails}
      imageUrl='https://avatars.githubusercontent.com/u/51144033?v=4'
      name='Preston Booth'
      phones={phones}
      username='prestonxyz'
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
      onEditProfilePicture={() => undefined}
      onManageEmail={() => undefined}
      onManagePhone={() => undefined}
      onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
      onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
      onNameChange={() => undefined}
      onUsernameChange={() => undefined}
    />
  );
}
