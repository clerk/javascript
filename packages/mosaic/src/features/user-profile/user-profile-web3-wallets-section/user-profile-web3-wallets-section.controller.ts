import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { usePanelTitle } from '../../../components/panel';
import { useActionLock } from '../../../hooks/use-action-lock';
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

type WalletAction =
  | { kind: 'connect'; providerId: UserProfileWeb3Provider['id']; target: Web3ConnectionTarget | null }
  | { kind: 'verify' | 'primary'; walletId: string };

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
  const actionLock = useActionLock();
  const action = usePendingAction({ actionLock, errorFallback: messages.errors.generic });
  const [picker, setPicker] = useState<SolanaPicker>({ open: false });
  const [owner, setOwner] = useState<WalletAction>();
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
  const removeWallet = useConfirmController<UserProfileWeb3Wallet>({
    actionLock,
    onConfirm: wallet => removalFocus.remove(wallet.id),
    reverification: removeReverification,
  });

  const runConnection = (provider: UserProfileWeb3Provider, walletName?: string) =>
    action.run(provider.id, async () => {
      setOwner({ kind: 'connect', providerId: provider.id, target: null });
      if (walletName) {
        setPicker({ open: true, kind: 'connect', provider, walletName });
      }
      try {
        await connect(provider.id, walletName, target => {
          setOwner({ kind: 'connect', providerId: provider.id, target });
          if (provider.walletPicker === 'solana' && target.kind === 'wallet') {
            setPicker({ open: false });
          }
        });
        setPicker({ open: false });
      } finally {
        setPicker(current =>
          current.open && current.kind === 'connect' ? { ...current, walletName: undefined } : current,
        );
      }
    });

  const runVerification = (walletId: string, walletName?: string) =>
    action.run(walletId, async () => {
      setOwner({ kind: 'verify', walletId });
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
      ? action.run(provider.id, () => {
          setOwner({ kind: 'connect', providerId: provider.id, target: null });
          setPicker({ open: true, kind: 'connect', provider });
        })
      : runConnection(provider);
  };

  const onVerify = (walletId: string) => {
    const wallet = wallets.find(candidate => candidate.id === walletId && candidate.canVerify);
    if (!wallet) {
      return;
    }
    return wallet.walletPicker === 'solana'
      ? action.run(walletId, () => {
          setOwner({ kind: 'verify', walletId });
          setPicker({ open: true, kind: 'verify', walletId });
        })
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

  const target = owner?.kind === 'connect' ? owner.target : null;
  const matchingWallets = target
    ? wallets.filter(wallet =>
        target.kind === 'wallet'
          ? wallet.id === target.id
          : owner?.kind === 'connect' &&
            wallet.providerId === owner.providerId &&
            normalizedWeb3Wallet(wallet.address) === target.address,
      )
    : [];
  const targetWallet = matchingWallets.length === 1 ? matchingWallets[0] : undefined;
  const ownerId = owner?.kind === 'connect' ? (targetWallet?.id ?? owner.providerId) : owner?.walletId;
  const pendingId = action.pendingKey ? ownerId : undefined;
  const errorId = action.errorKey ? ownerId : undefined;
  const actionFinalFocus = () => (ownerId ? removalFocus.trigger(ownerId) : null);

  return {
    wallets: wallets.map(wallet =>
      errorId === wallet.id
        ? owner?.kind === 'primary'
          ? { ...wallet, primaryError: action.error }
          : { ...wallet, verifyError: action.error }
        : wallet,
    ),
    availableProviders: availableProviders.map(provider =>
      errorId === provider.id && (!picker.open || picker.kind !== 'connect' || picker.provider.id !== provider.id)
        ? { ...provider, connectError: action.error }
        : provider,
    ),
    error:
      !picker.open &&
      errorId &&
      !wallets.some(wallet => wallet.id === errorId) &&
      !availableProviders.some(provider => provider.id === errorId)
        ? action.error
        : undefined,
    pendingId,
    pendingPrimaryId: owner?.kind === 'primary' ? pendingId : undefined,
    isDisabled: actionLock.isPending,
    sectionRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: remove ? removeWallet : undefined,
    finalFocus: removalFocus.finalFocus,
    setPrimaryReverification,
    createReverification,
    setPrimaryFinalFocus: actionFinalFocus,
    createFinalFocus: actionFinalFocus,
    solanaFinalFocus: actionFinalFocus,
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
    onSetPrimary: (walletId: string) =>
      action.run(walletId, () => {
        setOwner({ kind: 'primary', walletId });
        return setPrimary(walletId);
      }),
    connectSolana,
    closeSolanaPicker: () => {
      if (!action.isPending) {
        setPicker({ open: false });
      }
    },
  };
}
