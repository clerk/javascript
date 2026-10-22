import { useSuspenseProfile } from '@clerk/loom/react';

import { useReverificationFlow } from '../../features/reverification';
import { projectWeb3Wallets } from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.model';
import type {
  ReadyWeb3WalletsModel,
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
} from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.types';
import { allowsIdentificationCreation } from '../../utils/allows-identification-creation';

export type LoomWalletsState =
  | { kind: 'snapshot'; wallets: UserProfileWeb3Wallet[]; availableProviders: UserProfileWeb3Provider[] }
  | { kind: 'interactive'; model: ReadyWeb3WalletsModel };

export function useLoomProfileWalletsModel(): LoomWalletsState | null {
  const { user, settings, actions } = useSuspenseProfile();
  const [removeWallet, removeReverification] = useReverificationFlow((id: string) => {
    const remove = actions.wallet.remove;
    if (!remove) {
      throw new Error('Wallet removal unavailable.');
    }
    return remove(id);
  });
  const [setPrimaryWallet, setPrimaryReverification] = useReverificationFlow((id: string) => {
    const setPrimary = actions.wallet.setPrimary;
    if (!setPrimary) {
      throw new Error('Wallet selection unavailable.');
    }
    return setPrimary(id);
  });
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
  if (!actions.wallet.available || !actions.wallet.setPrimary) {
    return {
      kind: 'snapshot',
      ...projection,
      wallets: projection.wallets.map(wallet => ({ ...wallet, canRemove: !settings.web3Wallet?.immutable })),
    };
  }
  return {
    kind: 'interactive',
    model: {
      userId: user.id,
      ...projection,
      connect: actions.wallet.connect,
      setPrimary: id => setPrimaryWallet(id),
      remove: actions.wallet.remove ? id => removeWallet(id) : undefined,
      removeReverification,
      setPrimaryReverification,
    },
  };
}
