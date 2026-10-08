import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { ReadyWeb3WalletsModel, UserProfileWeb3Provider } from './user-profile-web3-wallets-section.types';

type SolanaPicker = { open: false } | { open: true; provider: UserProfileWeb3Provider; walletName?: string };

export function useUserProfileWeb3WalletsController({
  wallets,
  availableProviders,
  connect,
  setPrimary,
  remove,
}: Pick<ReadyWeb3WalletsModel, 'wallets' | 'availableProviders' | 'connect' | 'setPrimary' | 'remove'>) {
  const messages = useMessages('userProfileWeb3Wallets');
  const action = usePendingAction({ errorFallback: messages.errors.generic });
  const [picker, setPicker] = useState<SolanaPicker>({ open: false });

  const onConnect = (id: string) => {
    const provider = availableProviders.find(candidate => candidate.id === id);
    if (!provider) {
      return;
    }
    // TODO: Open the Solana picker without pending while preserving the same-render action lock.
    return action.run(provider.id, () => {
      if (provider.walletPicker === 'solana') {
        setPicker({ open: true, provider });
        return;
      }
      return connect(provider.id);
    });
  };

  const connectSolana = (walletName: string) => {
    if (!picker.open) {
      return;
    }
    return action.run(picker.provider.id, async () => {
      setPicker({ ...picker, walletName });
      await connect(picker.provider.id, walletName);
      setPicker({ open: false });
    });
  };

  return {
    wallets: wallets.map(wallet =>
      action.errorKey === wallet.id ? { ...wallet, primaryError: action.error } : wallet,
    ),
    availableProviders: availableProviders.map(provider =>
      action.errorKey === provider.id && (!picker.open || picker.provider.id !== provider.id)
        ? { ...provider, connectError: action.error }
        : provider,
    ),
    pendingId: action.pendingKey,
    solanaPickerOpen: picker.open,
    solanaPickerError: picker.open && picker.provider.id === action.errorKey ? action.error : undefined,
    pendingWalletName: picker.open && picker.provider.id === action.pendingKey ? picker.walletName : undefined,
    onConnect,
    onSetPrimary: (walletId: string) => action.run(walletId, () => setPrimary(walletId)),
    onRemove: remove,
    connectSolana,
    closeSolanaPicker: () => {
      if (!action.isPending) {
        setPicker({ open: false });
      }
    },
  };
}
