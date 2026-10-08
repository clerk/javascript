import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { ReadyWeb3WalletsModel, UserProfileWeb3Provider } from './user-profile-web3-wallets-section.types';

export function useUserProfileWeb3WalletsController({
  wallets,
  availableProviders,
  connect,
  setPrimary,
  remove,
}: Pick<ReadyWeb3WalletsModel, 'wallets' | 'availableProviders' | 'connect' | 'setPrimary' | 'remove'>) {
  const messages = useMessages('userProfileWeb3Wallets');
  const action = usePendingAction({ errorFallback: messages.errors.generic });
  const [picker, setPicker] = useState<UserProfileWeb3Provider | null>(null);
  const [pendingWalletName, setPendingWalletName] = useState<string>();

  const onConnect = (id: string) => {
    const provider = availableProviders.find(candidate => candidate.id === id);
    if (!provider) {
      return;
    }
    // TODO: Open the Solana picker without pending while preserving the same-render action lock.
    return action.run(provider.id, () => {
      if (provider.walletPicker === 'solana') {
        setPicker(provider);
        return;
      }
      return connect(provider.id);
    });
  };

  const connectSolana = (walletName: string) => {
    if (!picker) {
      return;
    }
    return action.run(picker.id, async () => {
      setPendingWalletName(walletName);
      try {
        await connect(picker.id, walletName);
        setPicker(null);
      } finally {
        setPendingWalletName(undefined);
      }
    });
  };

  return {
    wallets: wallets.map(wallet =>
      action.errorKey === wallet.id ? { ...wallet, primaryError: action.error } : wallet,
    ),
    availableProviders: availableProviders.map(provider =>
      action.errorKey === provider.id && picker?.id !== provider.id
        ? { ...provider, connectError: action.error }
        : provider,
    ),
    pendingId: action.pendingKey,
    solanaPickerOpen: picker !== null,
    solanaPickerError: picker?.id === action.errorKey ? action.error : undefined,
    pendingWalletName,
    onConnect,
    onSetPrimary: (walletId: string) => action.run(walletId, () => setPrimary(walletId)),
    onRemove: remove,
    connectSolana,
    closeSolanaPicker: () => {
      if (!action.isPending) {
        setPicker(null);
      }
    },
  };
}
