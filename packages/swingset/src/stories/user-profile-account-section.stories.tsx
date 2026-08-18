import { UserProfileAccountSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-account-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-account-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileAccountSection',
  source: 'packages/ui/src/mosaic/user-profile/user-profile-account-section.view.tsx',
};

export function Default() {
  return (
    <UserProfileAccountSectionView
      emails={[
        { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
        { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
      ]}
      imageUrl='https://avatars.githubusercontent.com/u/51144033?v=4'
      name='Preston Booth'
      phones={[{ id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true }]}
      username='prestonxyz'
      onAddEmail={() => undefined}
      onAddPhone={() => undefined}
      onEditProfilePicture={() => undefined}
      onManageEmail={() => undefined}
      onManagePhone={() => undefined}
      onNameChange={() => undefined}
      onUsernameChange={() => undefined}
    />
  );
}
