import { UserProfileEmailSectionView } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.view';

import type { StoryMeta } from '@/lib/types';

import type { UserProfileEmailsFixtureOptions } from './fixtures/user-profile-emails';
import { useUserProfileEmailsFixture } from './fixtures/user-profile-emails';

export { default as __source } from './user-profile-email-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileEmailSection',
  label: 'Email',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-email-section/user-profile-email-section.view.tsx',
};

function EmailSection(options: UserProfileEmailsFixtureOptions) {
  const emails = useUserProfileEmailsFixture({ username: 'prestonxyz', ...options });

  return <UserProfileEmailSectionView {...emails} />;
}

export function Default() {
  return <EmailSection />;
}

export function AddEmailFails() {
  return <EmailSection failVerification />;
}

export function EmailLinkVerification() {
  return <EmailSection method='link' />;
}

export function EmailLinkFails() {
  return (
    <EmailSection
      method='link'
      failVerification
    />
  );
}

export function EmailSsoVerification() {
  return <EmailSection method='sso' />;
}

export function EmailSsoFails() {
  return (
    <EmailSection
      method='sso'
      failVerification
    />
  );
}

export function EmailRemovalPending() {
  return <EmailSection removalState='pending' />;
}

export function EmailRemovalError() {
  return <EmailSection removalState='error' />;
}
