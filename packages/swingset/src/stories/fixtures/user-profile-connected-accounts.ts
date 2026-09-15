import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '@clerk/ui/mosaic/features/user-profile/user-profile-connected-accounts-section.view';
import { useState } from 'react';

export const connectedAccount = {
  id: 'google',
  provider: 'Google',
  identifier: 'test@example.com',
  iconUrl: 'https://img.clerk.com/static/google.svg',
};
const connectionProviders: UserProfileConnectionProvider[] = [
  { id: 'google', provider: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'apple', provider: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
];

export function useConnectedAccountsFixture({
  initialAccounts = [connectedAccount],
  providers = connectionProviders,
  removalState,
}: {
  initialAccounts?: UserProfileConnectedAccount[];
  providers?: UserProfileConnectionProvider[];
  removalState?: 'pending' | 'error';
} = {}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const availableProviders = providers.filter(provider => !accounts.some(account => account.id === provider.id));

  return {
    accounts,
    availableProviders,
    onConnect: (id: string) => {
      const provider = providers.find(item => item.id === id);
      if (provider) {
        setAccounts(current => [
          ...current,
          { id: provider.id, provider: provider.provider, iconUrl: provider.iconUrl, identifier: 'test@example.com' },
        ]);
      }
    },
    onReconnect: (id: string) =>
      setAccounts(current =>
        current.map(account =>
          account.id === id
            ? { ...account, status: 'connected', reconnectError: undefined, verificationError: undefined }
            : account,
        ),
      ),
    onRemove: (id: string) =>
      setAccounts(current => {
        const account = current.find(item => item.id === id);
        if (removalState === 'pending') {
          return current.map(item => (item.id === id ? { ...item, isRemoving: true } : item));
        }
        if (removalState === 'error' && account && !account.removalError) {
          return current.map(item =>
            item.id === id ? { ...item, removalError: 'Unable to remove this account. Please try again.' } : item,
          );
        }
        return current.filter(item => item.id !== id);
      }),
  };
}
