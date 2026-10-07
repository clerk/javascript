import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import { normalizedWeb3Wallet } from './user-profile-web3-wallets-section.model';
import type {
  ReadyWeb3WalletsModel,
  UserProfileWeb3Provider,
  Web3ConnectionTarget,
} from './user-profile-web3-wallets-section.types';

type SolanaPicker =
  | { open: false }
  | { open: true; kind: 'connect'; provider: UserProfileWeb3Provider; walletName?: string }
  | { open: true; kind: 'verify'; walletId: string; walletName?: string };

export function useUserProfileWeb3WalletsController({
  wallets,
  availableProviders,
  connect,
  verify,
  setPrimary,
  remove,
}: Pick<ReadyWeb3WalletsModel, 'wallets' | 'availableProviders' | 'connect' | 'verify' | 'setPrimary' | 'remove'>) {
  const messages = useMessages('userProfileWeb3Wallets');
  const action = usePendingAction({ errorFallback: messages.errors.generic });
  const [picker, setPicker] = useState<SolanaPicker>({ open: false });
  const [connectionTarget, setConnectionTarget] = useState<{
    providerId: UserProfileWeb3Provider['id'];
    target: Web3ConnectionTarget;
  } | null>(null);

  const runConnection = (provider: UserProfileWeb3Provider, walletName?: string) => {
    return action.run(provider.id, async () => {
      setConnectionTarget(null);
      if (walletName) {
        setPicker(current => (current.open ? { ...current, walletName } : current));
      }
      let published = false;
      try {
        await connect(provider.id, walletName, target => {
          published = target.kind === 'wallet';
          setConnectionTarget({ providerId: provider.id, target });
          if (provider.walletPicker === 'solana' && published) {
            setPicker({ open: false });
          }
        });
        setPicker({ open: false });
      } catch (error) {
        if (published) {
          setPicker({ open: false });
        }
        throw error;
      } finally {
        setPicker(current => (current.open ? { ...current, walletName: undefined } : current));
      }
    });
  };

  const runVerification = (walletId: string, walletName?: string) =>
    action.run(walletId, async () => {
      setConnectionTarget(null);
      if (walletName) {
        setPicker(current => (current.open ? { ...current, walletName } : current));
      }
      try {
        await verify(walletId, walletName);
      } finally {
        setPicker({ open: false });
        setPicker(current => (current.open ? { ...current, walletName: undefined } : current));
      }
    });

  const onConnect = (id: string) => {
    const provider = availableProviders.find(candidate => candidate.id === id);
    if (!provider) {
      return;
    }
    if (provider.walletPicker === 'solana') {
      return action.run(provider.id, () => {
        setPicker({ open: true, kind: 'connect', provider });
      });
    }
    return runConnection(provider);
  };

  const onVerify = (walletId: string) => {
    const wallet = wallets.find(candidate => candidate.id === walletId && candidate.canVerify);
    if (!wallet) {
      return;
    }
    if (wallet.walletPicker === 'solana') {
      return action.run(walletId, () => {
        setPicker({ open: true, kind: 'verify', walletId });
      });
    }
    return runVerification(walletId);
  };

  const connectSolana = (walletName: string) => {
    if (!picker.open) {
      return;
    }
    return picker.kind === 'connect'
      ? runConnection(picker.provider, walletName)
      : runVerification(picker.walletId, walletName);
  };

  const targetWallet =
    connectionTarget &&
    (action.pendingKey === connectionTarget.providerId || action.errorKey === connectionTarget.providerId)
      ? wallets.find(wallet =>
          connectionTarget.target.kind === 'wallet'
            ? wallet.id === connectionTarget.target.id
            : wallet.providerId === connectionTarget.providerId &&
              normalizedWeb3Wallet(wallet.address) === connectionTarget.target.address,
        )
      : undefined;
  const pendingId = targetWallet && action.pendingKey ? targetWallet.id : action.pendingKey;
  const errorId = targetWallet && action.errorKey ? targetWallet.id : action.errorKey;

  return {
    wallets: wallets.map(wallet =>
      errorId === wallet.id
        ? wallet.canVerify
          ? { ...wallet, verifyError: action.error }
          : { ...wallet, primaryError: action.error }
        : wallet,
    ),
    availableProviders: availableProviders.map(provider =>
      errorId === provider.id && (!picker.open || picker.kind !== 'connect' || picker.provider.id !== provider.id)
        ? { ...provider, connectError: action.error }
        : provider,
    ),
    pendingId,
    solanaPickerOpen: picker.open,
    solanaPickerError:
      picker.open && picker.kind === 'connect' && picker.provider.id === action.errorKey && !targetWallet
        ? action.error
        : picker.open && picker.kind === 'verify' && picker.walletId === action.errorKey
          ? action.error
          : undefined,
    pendingWalletName: picker.open ? picker.walletName : undefined,
    onConnect,
    onVerify,
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
