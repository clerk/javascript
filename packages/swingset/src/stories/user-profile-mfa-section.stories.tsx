import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileMfaExample } from './fixtures/user-profile-mfa-example';

export { default as __source } from './user-profile-mfa-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'UserProfileMfaSection',
  label: '2-step verification',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-mfa-section.view.tsx',
};

export function Default() {
  const mfa = useUserProfileMfaExample();
  return <UserProfileMfaSectionView {...mfa.section} />;
}
