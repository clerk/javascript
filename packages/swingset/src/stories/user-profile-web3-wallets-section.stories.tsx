import { UserProfileWeb3WalletsSectionView } from '@clerk/ui/mosaic/features/user-profile/user-profile-web3-wallets-section.view';

import type { StoryMeta } from '@/lib/types';

import { primaryWallet, secondaryWallet, useWeb3WalletsFixture } from './fixtures/user-profile-web3-wallets';

export { default as __source } from './user-profile-web3-wallets-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'UserProfileWeb3WalletsSection',
  label: 'Web3 wallets',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/features/user-profile/user-profile-web3-wallets-section.view.tsx',
};

export function Default() {
  const fixture = useWeb3WalletsFixture();
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function ConnectedWallets() {
  const fixture = useWeb3WalletsFixture({ initialWallets: [primaryWallet, secondaryWallet] });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function ConnectOnly() {
  const fixture = useWeb3WalletsFixture({ initialWallets: [] });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function UnverifiedWallet() {
  const fixture = useWeb3WalletsFixture({
    initialWallets: [{ ...primaryWallet, isPrimary: false, isVerified: false }],
  });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function AdminWallet() {
  const fixture = useWeb3WalletsFixture({
    initialWallets: [{ id: 'admin_wallet', address: primaryWallet.address, isVerified: true }],
    availableProviders: [],
  });
  return fixture.wallets.length > 0 ? <UserProfileWeb3WalletsSectionView {...fixture} /> : null;
}

export function ConnectionError() {
  const fixture = useWeb3WalletsFixture({
    initialWallets: [],
    availableProviders: [
      {
        id: 'metamask',
        provider: 'MetaMask',
        iconUrl: primaryWallet.iconUrl,
        connectError: 'Wallet extension not found. Check your wallet and try again.',
      },
    ],
  });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function PrimaryError() {
  const fixture = useWeb3WalletsFixture({ initialWallets: [primaryWallet, secondaryWallet], primaryError: true });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function RemovalPending() {
  const fixture = useWeb3WalletsFixture({ removalState: 'pending' });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}

export function RemovalError() {
  const fixture = useWeb3WalletsFixture({ removalState: 'error' });
  return <UserProfileWeb3WalletsSectionView {...fixture} />;
}
