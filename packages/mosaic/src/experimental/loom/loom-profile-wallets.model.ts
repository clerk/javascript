import { useProfileSnapshot } from '@clerk/loom/handoff';

import { projectWeb3Wallets } from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.model';
import type {
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
} from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.types';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';

export type LoomWalletsState = { wallets: UserProfileWeb3Wallet[]; availableProviders: UserProfileWeb3Provider[] };

export function useLoomProfileWalletsModel(): LoomWalletsState | null {
  const { user, settings } = useProfileSnapshot();
  if (!settings.web3Wallet?.enabled) {
    return null;
  }
  if (!user.web3Wallets) {
    throw new Error('Loom wallet data is unavailable.');
  }
  const projection = projectWeb3Wallets({
    wallets: user.web3Wallets.map(wallet => ({
      id: wallet.id,
      web3Wallet: wallet.web3Wallet,
      verification: {
        strategy: wallet.verification?.strategy ?? null,
        status: wallet.verification?.status ?? null,
        expireAt: wallet.verification?.expireAt == null ? null : new Date(wallet.verification.expireAt),
      },
    })),
    primaryId: user.primaryWeb3WalletId ?? null,
    enabledStrategies: settings.web3FirstFactors ?? [],
    allowCreation:
      !settings.web3Wallet.immutable && allowsIdentificationCreation(user, { enabled: settings.enterpriseSsoEnabled }),
  });
  if (projection.status === 'hidden') {
    return null;
  }
  return {
    wallets: projection.wallets.map(wallet => ({ ...wallet, canRemove: !settings.web3Wallet?.immutable })),
    availableProviders: projection.availableProviders,
  };
}
