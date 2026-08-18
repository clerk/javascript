import { UserProfileWeb3WalletsSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-web3-wallets-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-web3-wallets-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileWeb3WalletsSection',
  label: 'Web3 wallets',
  navigation: { family: 'User profile', category: 'Sections', order: 70 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-web3-wallets-section.view.tsx',
};

export function Default() {
  return (
    <UserProfileWeb3WalletsSectionView
      wallets={[
        {
          id: 'metamask',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          provider: 'MetaMask',
          iconUrl: 'https://img.clerk.com/static/metamask.svg',
          isPrimary: true,
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
      onManage={() => undefined}
    />
  );
}
