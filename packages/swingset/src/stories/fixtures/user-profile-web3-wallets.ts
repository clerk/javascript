import type {
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
} from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section.view';
import { useState } from 'react';

interface DemoWallet extends UserProfileWeb3Wallet {
  providerId?: string;
}

const providers: UserProfileWeb3Provider[] = [
  { id: 'metamask', provider: 'MetaMask', iconUrl: 'https://img.clerk.com/static/metamask.svg' },
  { id: 'coinbase-wallet', provider: 'Coinbase Wallet', iconUrl: 'https://img.clerk.com/static/coinbase_wallet.svg' },
];

export const primaryWallet: DemoWallet = {
  id: 'wallet_1',
  providerId: 'metamask',
  provider: 'MetaMask',
  iconUrl: 'https://img.clerk.com/static/metamask.svg',
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  isPrimary: true,
  isVerified: true,
};

export const secondaryWallet: DemoWallet = {
  id: 'wallet_2',
  providerId: 'coinbase-wallet',
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
}: {
  initialWallets?: DemoWallet[];
  availableProviders?: UserProfileWeb3Provider[];
  primaryError?: boolean;
  removalState?: 'pending' | 'error';
} = {}) {
  const [wallets, setWallets] = useState(initialWallets);
  const [connectionProviders, setConnectionProviders] = useState(availableProviders);
  const [removalFailed, setRemovalFailed] = useState(false);
  const [primaryFailed, setPrimaryFailed] = useState(false);

  return {
    wallets,
    availableProviders: connectionProviders.filter(
      provider => !wallets.some(wallet => wallet.providerId === provider.id && wallet.isVerified),
    ),
    onConnect: (id: string) => {
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
    onSetPrimary: (id: string) => {
      if (primaryError && !primaryFailed) {
        setPrimaryFailed(true);
        setWallets(current =>
          current.map(wallet =>
            wallet.id === id
              ? { ...wallet, primaryError: 'Unable to set this wallet as primary. Please try again.' }
              : wallet,
          ),
        );
        return;
      }
      setWallets(current =>
        current.map(wallet => ({ ...wallet, isPrimary: wallet.id === id, primaryError: undefined })),
      );
    },
    onRemove: async (id: string) => {
      if (removalState === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      if (removalState === 'error' && !removalFailed) {
        setRemovalFailed(true);
        throw new Error('Unable to remove wallet. Please try again.');
      }
      setWallets(current => current.filter(wallet => wallet.id !== id));
    },
  };
}
