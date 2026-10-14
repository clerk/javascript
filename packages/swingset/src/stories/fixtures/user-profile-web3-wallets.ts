import { useUserProfileWeb3WalletsController } from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.controller';
import type {
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
} from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.types';
import type { Web3Strategy } from '@clerk/shared/types';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosText } from '@/lib/chaos';

interface DemoWallet extends UserProfileWeb3Wallet {
  providerId?: string;
}

const providers: UserProfileWeb3Provider[] = [
  { id: 'web3_metamask_signature', provider: 'MetaMask', iconUrl: 'https://img.clerk.com/static/metamask.svg' },
  {
    id: 'web3_coinbase_wallet_signature',
    provider: 'Coinbase Wallet',
    iconUrl: 'https://img.clerk.com/static/coinbase_wallet.svg',
  },
];

export const primaryWallet: DemoWallet = {
  id: 'wallet_1',
  providerId: 'web3_metamask_signature',
  provider: 'MetaMask',
  iconUrl: 'https://img.clerk.com/static/metamask.svg',
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  isPrimary: true,
  isVerified: true,
};

export const secondaryWallet: DemoWallet = {
  id: 'wallet_2',
  providerId: 'web3_coinbase_wallet_signature',
  provider: 'Coinbase Wallet',
  iconUrl: 'https://img.clerk.com/static/coinbase_wallet.svg',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  isVerified: true,
};

export function useWeb3WalletsFixture({
  initialWallets = [primaryWallet],
  availableProviders = providers,
  primaryError = false,
  removalState,
  fallbackFocus,
}: {
  initialWallets?: DemoWallet[];
  availableProviders?: UserProfileWeb3Provider[];
  primaryError?: boolean;
  removalState?: 'pending' | 'error';
  fallbackFocus?: () => HTMLElement | null;
} = {}) {
  const seedWallets = useChaosFixture(initialWallets, items =>
    items.map(wallet => ({ ...wallet, provider: chaosText(wallet.provider) })),
  );
  const seedProviders = useChaosFixture(availableProviders, items =>
    items.map(provider => ({ ...provider, provider: chaosText(provider.provider) })),
  );
  const [wallets, setWallets] = useState(seedWallets);
  const [connectionProviders, setConnectionProviders] = useState(seedProviders);
  const [removalFailed, setRemovalFailed] = useState(false);
  const primaryFailed = useRef(false);

  return useUserProfileWeb3WalletsController({
    wallets,
    availableProviders: connectionProviders.filter(
      provider => !wallets.some(wallet => wallet.providerId === provider.id && wallet.isVerified),
    ),
    fallbackFocus,
    // eslint-disable-next-line @typescript-eslint/require-await
    connect: async (id: Web3Strategy) => {
      const provider = connectionProviders.find(item => item.id === id);
      if (!provider) {
        return;
      }
      setConnectionProviders(current =>
        current.map(item => (item.id === id ? { ...item, connectError: undefined } : item)),
      );
      setWallets(current => {
        if (current.some(wallet => wallet.providerId === id && !wallet.isVerified)) {
          return current.map(wallet => (wallet.providerId === id ? { ...wallet, isVerified: true } : wallet));
        }
        return [
          ...current,
          {
            provider: provider.provider,
            iconUrl: provider.iconUrl,
            id: `wallet_${id}`,
            providerId: id,
            address: '0x1234567890abcdef1234567890abcdef12345678',
            isVerified: true,
            isPrimary: !current.some(wallet => wallet.isPrimary),
          },
        ];
      });
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    setPrimary: async (id: string) => {
      if (primaryError && !primaryFailed.current) {
        primaryFailed.current = true;
        throw new Error('Unable to set this wallet as primary. Please try again.');
      }
      setWallets(current => current.map(wallet => ({ ...wallet, isPrimary: wallet.id === id })));
    },
    remove: async (id: string) => {
      if (removalState === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      if (removalState === 'error' && !removalFailed) {
        setRemovalFailed(true);
        throw new Error('Unable to remove wallet. Please try again.');
      }
      setWallets(current => current.filter(wallet => wallet.id !== id));
    },
  });
}
