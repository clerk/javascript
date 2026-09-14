import { UserProfileWeb3WalletsSectionView } from '@clerk/ui/mosaic/features/user-profile/user-profile-web3-wallets-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-web3-wallets-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileWeb3WalletsSection',
  label: 'Web3 wallets',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/features/user-profile/user-profile-web3-wallets-section.view.tsx',
};

export function Default() {
  const [connected, setConnected] = useState(true);
  return (
    <UserProfileWeb3WalletsSectionView
      wallets={[
        {
          id: 'metamask',
          address: connected ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' : undefined,
          connected,
          provider: 'MetaMask',
          iconUrl: 'https://img.clerk.com/static/metamask.svg',
          isPrimary: connected,
          isVerified: true,
        },
        {
          id: 'coinbase-wallet',
          provider: 'Coinbase Wallet',
          iconUrl: 'https://img.clerk.com/static/coinbase_wallet.svg',
          connected: false,
        },
      ]}
      onConnect={() => undefined}
      onRemove={() => setConnected(false)}
    />
  );
}
