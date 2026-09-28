import { iconImageUrl } from '@clerk/shared/constants';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';

import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.view';

export interface Web3WalletEntry {
  id: string;
  address: string;
  strategy: string;
  status: string | null;
  expireAt?: Date | null;
}

export type Web3WalletsProjection =
  | { status: 'hidden' }
  | { status: 'ready'; wallets: UserProfileWeb3Wallet[]; availableProviders: UserProfileWeb3Provider[] };

export function projectWeb3Wallets({
  wallets,
  primaryId,
  enabledStrategies,
  allowCreation,
}: {
  wallets: readonly Web3WalletEntry[];
  primaryId: string | null;
  enabledStrategies: readonly string[];
  allowCreation: boolean;
}): Web3WalletsProjection {
  if (!allowCreation && wallets.length === 0) {
    return { status: 'hidden' };
  }

  const providers = WEB3_PROVIDERS.filter(provider => enabledStrategies.includes(provider.strategy));
  const knownWallets = wallets.filter(
    wallet => wallet.strategy === 'admin' || WEB3_PROVIDERS.some(provider => provider.strategy === wallet.strategy),
  );
  const sorted = [...knownWallets].sort((first, second) => {
    if (first.id === primaryId) {
      return -1;
    }
    if (second.id === primaryId) {
      return 1;
    }
    const firstRank = first.status === 'verified' ? 0 : first.status ? 1 : 2;
    const secondRank = second.status === 'verified' ? 0 : second.status ? 1 : 2;
    if (firstRank !== secondRank) {
      return firstRank - secondRank;
    }
    if (firstRank === 0) {
      return first.id.localeCompare(second.id);
    }
    if (firstRank === 1 && first.expireAt && second.expireAt) {
      return first.expireAt.getTime() - second.expireAt.getTime();
    }
    return 0;
  });

  const connectedStrategies = new Set(
    wallets.filter(wallet => wallet.status === 'verified').map(wallet => wallet.strategy),
  );

  return {
    status: 'ready',
    wallets: sorted.map(wallet => {
      const provider = WEB3_PROVIDERS.find(candidate => candidate.strategy === wallet.strategy);
      return {
        id: wallet.id,
        address: wallet.address,
        provider: provider?.name,
        iconUrl: provider ? iconImageUrl(provider.provider) : undefined,
        isPrimary: wallet.id === primaryId,
        isVerified: wallet.status === 'verified',
      };
    }),
    availableProviders: allowCreation
      ? providers
          .filter(provider => !connectedStrategies.has(provider.strategy))
          .map(provider => ({
            id: provider.strategy,
            provider: provider.name,
            iconUrl: iconImageUrl(provider.provider),
          }))
      : [],
  };
}
