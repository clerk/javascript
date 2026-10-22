import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { usePanelTitle } from '../../../components/panel';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type {
  ReadyWeb3WalletsModel,
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
  Web3ConnectionTarget,
} from './user-profile-web3-wallets-section.types';
import { normalizedWeb3Wallet } from './user-profile-web3-wallets-section.utils';

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
  removeReverification,
  setPrimaryReverification,
  createReverification,
}: Pick<
  ReadyWeb3WalletsModel,
  | 'wallets'
  | 'availableProviders'
  | 'connect'
  | 'verify'
  | 'setPrimary'
  | 'remove'
  | 'removeReverification'
  | 'setPrimaryReverification'
  | 'createReverification'
>) {
  const messages = useMessages('userProfileWeb3Wallets');
  const action = usePendingAction({ errorFallback: messages.errors.generic });
  const [picker, setPicker] = useState<SolanaPicker>({ open: false });
  const [connectionTarget, setConnectionTarget] = useState<{
    providerId: UserProfileWeb3Provider['id'];
    target: Web3ConnectionTarget;
  }>();
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelTitle = usePanelTitle();
  const removalFocus = useListRemovalFocus({
    ids: wallets.map(wallet => wallet.id),
    onRemove: remove,
    fallback: () =>
      sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ??
      sectionRef.current ??
      panelTitle(),
  });
  // TODO: Share the action lock during removal while preserving errors for the confirmation dialog.
  const removeWallet = useConfirmController<UserProfileWeb3Wallet>({
    onConfirm: wallet => removalFocus.remove(wallet.id),
    reverification: removeReverification,
  });

  const runConnection = (provider: UserProfileWeb3Provider, walletName?: string) =>
    action.run(provider.id, async () => {
      setConnectionTarget(undefined);
      if (walletName) {
        setPicker({ open: true, kind: 'connect', provider, walletName });
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
        setPicker(current =>
          current.open && current.kind === 'connect' ? { ...current, walletName: undefined } : current,
        );
      }
    });

  const runVerification = (walletId: string, walletName?: string) =>
    action.run(walletId, async () => {
      setConnectionTarget(undefined);
      if (walletName) {
        setPicker({ open: true, kind: 'verify', walletId, walletName });
      }
      try {
        await verify(walletId, walletName);
      } finally {
        setPicker({ open: false });
      }
    });

  const onConnect = (id: string) => {
    const provider = availableProviders.find(candidate => candidate.id === id);
    if (!provider) {
      return;
    }
    return provider.walletPicker === 'solana'
      ? action.run(provider.id, () => setPicker({ open: true, kind: 'connect', provider }))
      : runConnection(provider);
  };

  const onVerify = (walletId: string) => {
    const wallet = wallets.find(candidate => candidate.id === walletId && candidate.canVerify);
    if (!wallet) {
      return;
    }
    return wallet.walletPicker === 'solana'
      ? action.run(walletId, () => setPicker({ open: true, kind: 'verify', walletId }))
      : runVerification(walletId);
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
    sectionRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: remove ? removeWallet : undefined,
    finalFocus: removalFocus.finalFocus,
    setPrimaryReverification,
    createReverification,
    setPrimaryFinalFocus: () => (action.lastKey ? removalFocus.trigger(action.lastKey) : null),
    createFinalFocus: () => (action.lastKey ? removalFocus.trigger(action.lastKey) : null),
    solanaPickerOpen: picker.open,
    solanaPickerError:
      picker.open &&
      !targetWallet &&
      (picker.kind === 'connect' ? picker.provider.id === action.errorKey : picker.walletId === action.errorKey)
        ? action.error
        : undefined,
    pendingWalletName: picker.open ? picker.walletName : undefined,
    onConnect,
    onVerify,
    onSetPrimary: (walletId: string) => action.run(walletId, () => setPrimary(walletId)),
    connectSolana,
    closeSolanaPicker: () => {
      if (!action.isPending) {
        setPicker({ open: false });
      }
    },
  };
}
