import { UserProfileConnectedAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section.view';

import type { StoryMeta } from '@/lib/types';

import { connectedAccount, useConnectedAccountsFixture } from './fixtures/user-profile-connected-accounts';

export { default as __source } from './user-profile-connected-accounts-section.stories?raw';
export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileConnectedAccountsSection',
  label: 'Connected accounts',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-connected-accounts-section.view.tsx',
};
export function Default() {
  const fixture = useConnectedAccountsFixture();
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function LinkedAccounts() {
  const fixture = useConnectedAccountsFixture({ providers: [connectedAccount] });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function ConnectOnly() {
  const fixture = useConnectedAccountsFixture({ initialAccounts: [] });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function ReconnectRequired() {
  const fixture = useConnectedAccountsFixture({ initialAccounts: [{ ...connectedAccount, status: 'reconnect' }] });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function VerificationError() {
  const fixture = useConnectedAccountsFixture({
    initialAccounts: [
      { ...connectedAccount, status: 'error', verificationError: 'The provider could not verify this account.' },
    ],
  });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function ConnectionError() {
  const fixture = useConnectedAccountsFixture({
    providers: [
      connectedAccount,
      {
        id: 'apple',
        provider: 'Apple',
        iconUrl: 'https://img.clerk.com/static/apple.svg',
        connectError: 'Unable to connect. Please try again.',
      },
    ],
  });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function RemovalPending() {
  const fixture = useConnectedAccountsFixture({ removalState: 'pending' });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
export function RemovalError() {
  const fixture = useConnectedAccountsFixture({ removalState: 'error' });
  return <UserProfileConnectedAccountsSectionView {...fixture} />;
}
