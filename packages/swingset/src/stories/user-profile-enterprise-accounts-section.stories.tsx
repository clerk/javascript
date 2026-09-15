import { UserProfileEnterpriseAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.view';

import type { StoryMeta } from '@/lib/types';

import { accounts, useEnterpriseAccountsFixture } from './fixtures/user-profile-enterprise-accounts';

export { default as __source } from './user-profile-enterprise-accounts-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileEnterpriseAccountsSection',
  label: 'Enterprise accounts',
  navigation: { category: 'Sections' },
  source:
    'packages/ui/src/mosaic/features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.view.tsx',
};

export function Default() {
  const fixture = useEnterpriseAccountsFixture();
  return <UserProfileEnterpriseAccountsSectionView {...fixture} />;
}

export function LinkedAccounts() {
  return <UserProfileEnterpriseAccountsSectionView accounts={accounts} />;
}

export function RequiresAction() {
  return (
    <UserProfileEnterpriseAccountsSectionView
      accounts={accounts.map(account => ({ ...account, requiresAction: true }))}
    />
  );
}

export function ConnectOnly() {
  const fixture = useEnterpriseAccountsFixture({ initialAccounts: [] });
  return <UserProfileEnterpriseAccountsSectionView {...fixture} />;
}

export function ConnectionError() {
  const fixture = useEnterpriseAccountsFixture({
    initialError: 'Unable to connect your account. Please try again.',
  });
  return <UserProfileEnterpriseAccountsSectionView {...fixture} />;
}
