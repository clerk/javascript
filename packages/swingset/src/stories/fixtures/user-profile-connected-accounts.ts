import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosText } from '@/lib/chaos';

export const connectedAccount: UserProfileConnectedAccount = {
  id: 'google',
  providerId: 'google',
  provider: 'Google',
  identifier: 'test@example.com',
  iconUrl: 'https://img.clerk.com/static/google.svg',
  status: 'connected',
};
const connectionProviders: UserProfileConnectionProvider[] = [
  { id: 'google', provider: 'Google', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'apple', provider: 'Apple', iconUrl: 'https://img.clerk.com/static/apple.svg' },
];

export function useConnectedAccountsFixture({
  initialAccounts = [connectedAccount],
  providers: initialProviders = connectionProviders,
  removalState,
}: {
  initialAccounts?: UserProfileConnectedAccount[];
  providers?: UserProfileConnectionProvider[];
  removalState?: 'pending' | 'error';
} = {}) {
  const [hasRemovalFailed, setHasRemovalFailed] = useState(false);
  const seed = useChaosFixture(initialAccounts, items =>
    items.map((account, index) => ({
      ...account,
      provider: chaosText(account.provider),
      identifier: chaosEmail(index),
    })),
  );
  const [accounts, setAccounts] = useState(seed);
  const providers = useChaosFixture(initialProviders, items =>
    items.map(provider => ({ ...provider, provider: chaosText(provider.provider) })),
  );
  const availableProviders = providers.filter(provider => !accounts.some(account => account.id === provider.id));

  return {
    accounts,
    availableProviders,
    onConnect: (id: string) => {
      const provider = providers.find(item => item.id === id);
      if (provider) {
        setAccounts(current => [
          ...current,
          {
            id: provider.id,
            providerId: provider.id,
            provider: provider.provider,
            iconUrl: provider.iconUrl,
            identifier: 'test@example.com',
            status: 'connected',
          },
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
    onRemove: async (id: string) => {
      if (removalState === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      if (removalState === 'error' && !hasRemovalFailed) {
        setHasRemovalFailed(true);
        throw new Error('Unable to remove this account. Please try again.');
      }
      setAccounts(current => current.filter(item => item.id !== id));
    },
  };
}
