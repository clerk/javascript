import type { UserProfileConnectedAccount } from '@clerk/ui/mosaic/user-profile/user-profile-connected-accounts-section.view';
import { UserProfileConnectedAccountsSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-connected-accounts-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-connected-accounts-section.stories?raw';
export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileConnectedAccountsSection',
  label: 'Connected accounts',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-connected-accounts-section.view.tsx',
};
const account = {
  id: 'google-account',
  provider: 'Google',
  identifier: 'test@example.com',
  iconUrl: 'https://img.clerk.com/static/google.svg',
};
const providers = [
  { id: 'apple', provider: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
  { id: 'custom', provider: 'Custom OAuth' },
];

export function Default() {
  const [accounts, setAccounts] = useState<UserProfileConnectedAccount[]>([account]);
  const [pending, setPending] = useState<string>();
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={accounts}
      availableProviders={providers}
      connectingProviderId={pending}
      onConnect={setPending}
      onRemove={id => setAccounts(current => current.filter(item => item.id !== id))}
    />
  );
}
export function LinkedAccounts() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[account]}
      onRemove={() => undefined}
    />
  );
}
export function ConnectOnly() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[]}
      availableProviders={providers}
      onConnect={() => undefined}
    />
  );
}
export function Connecting() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[account]}
      availableProviders={providers}
      connectingProviderId='apple'
      onConnect={() => undefined}
    />
  );
}
export function ReconnectRequired() {
  const [error, setError] = useState<string>();
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[{ ...account, status: 'reconnect' }]}
      onReconnect={() => setError('Unable to reconnect. Please try again.')}
      errorMessage={error}
      onRemove={() => undefined}
    />
  );
}
export function VerificationError() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[{ ...account, status: 'error', verificationError: 'The provider could not verify this account.' }]}
      onRemove={() => undefined}
    />
  );
}
export function ConnectionError() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[account]}
      availableProviders={providers}
      errorMessage='Unable to connect. Please try again.'
      onConnect={() => undefined}
    />
  );
}
export function RemovalPending() {
  const [pending, setPending] = useState(false);
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[{ ...account, isRemoving: pending }]}
      onRemove={() => setPending(true)}
    />
  );
}
export function RemovalError() {
  const [error, setError] = useState<string>();
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[{ ...account, removalError: error }]}
      onRemove={() => setError('Unable to remove this account. Please try again.')}
    />
  );
}
export function DisplayEdgeCases() {
  return (
    <UserProfileConnectedAccountsSectionView
      accounts={[
        { id: 'custom', provider: 'Custom OAuth', iconUrl: ' ' },
        {
          id: 'long',
          provider: 'International Identity Provider With A Very Long Display Name',
          identifier: 'someone.with.a.very.long.identifier@international.example.com',
        },
      ]}
      onRemove={() => undefined}
    />
  );
}
export function Empty() {
  return <UserProfileConnectedAccountsSectionView accounts={[]} />;
}
