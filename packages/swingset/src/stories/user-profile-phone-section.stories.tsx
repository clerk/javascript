import { UserProfilePhoneSectionView } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.view';

import type { StoryMeta } from '@/lib/types';

import type { UserProfilePhonesFixtureOptions } from './fixtures/user-profile-phones';
import { useUserProfilePhonesFixture } from './fixtures/user-profile-phones';

export { default as __source } from './user-profile-phone-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfilePhoneSection',
  label: 'Phone',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-phone-section/user-profile-phone-section.view.tsx',
};

function PhoneSection(options: UserProfilePhonesFixtureOptions) {
  const phones = useUserProfilePhonesFixture(options);

  return <UserProfilePhoneSectionView {...phones} />;
}

export function Default() {
  return <PhoneSection />;
}

export function AddPhoneFails() {
  return <PhoneSection fail='create' />;
}

export function PhoneRemovalPending() {
  return <PhoneSection removalState='pending' />;
}

export function PhoneRemovalError() {
  return <PhoneSection removalState='error' />;
}
