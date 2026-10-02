import { useState } from 'react';

import { usePendingActionById } from '../../../hooks/use-pending-action-by-id';
import { useMessages } from '../../../localization';
import type { UserProfileWeb3Provider } from '../user-profile-web3-wallets-section.view';
import type { ReadyWeb3WalletsModel } from './user-profile-web3-wallets-section.types';

export function useUserProfileWeb3WalletsController({
  wallets,
  availableProviders,
  connect,
  setPrimary,
}: Pick<ReadyWeb3WalletsModel, 'wallets' | 'availableProviders' | 'connect' | 'setPrimary'>) {
  const messages = useMessages('userProfileWeb3Wallets');
  const action = usePendingActionById(messages.errors.generic);
  const [picker, setPicker] = useState<UserProfileWeb3Provider | null>(null);
  const [pendingWalletName, setPendingWalletName] = useState<string>();

  const onConnect = (id: string) => {
    if (action.busy()) {
      return;
    }
    const provider = availableProviders.find(candidate => candidate.id === id);
    if (!provider) {
      return;
    }
    if (provider.walletPicker === 'solana') {
      setPicker(provider);
      return;
    }
    return action.run(provider.id, () => connect(provider.id));
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
      action.errors[wallet.id] ? { ...wallet, primaryError: action.errors[wallet.id] } : wallet,
    ),
    availableProviders: availableProviders.map(provider =>
      action.errors[provider.id] && picker?.id !== provider.id
        ? { ...provider, connectError: action.errors[provider.id] }
        : provider,
    ),
    pendingId: action.pendingId,
    solanaPickerOpen: picker !== null,
    solanaPickerError: picker ? action.errors[picker.id] : undefined,
    pendingWalletName,
    onConnect,
    onSetPrimary: (walletId: string) => action.run(walletId, () => setPrimary(walletId)),
    connectSolana,
    closeSolanaPicker: () => {
      if (!action.busy()) {
        setPicker(null);
      }
    },
  };
}
