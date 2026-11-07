import { isReverificationCancelledError } from '@clerk/shared/error';
import { useRef, useState } from 'react';

import { useConfirmController } from '../../../blocks/confirm';
import { usePanelTitle } from '../../../components/panel';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { type ErrorDescription, useErrorText, useMessages } from '../../../localization';
import { createAsyncLogic, setup } from '../../../machine/setup';
import type { AsyncArgs, InputArgs, TransitionResult } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import { applyOrder } from '../../../utils/apply-order';
import { toLocalizableError } from '../../../utils/errors';
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
  | { kind: 'connect'; provider: UserProfileWeb3Provider; target: Web3ConnectionTarget | null }
  | { kind: 'verify' | 'primary'; walletId: string };

type WalletModel = Pick<ReadyWeb3WalletsModel, 'connect' | 'verify' | 'setPrimary'>;

type Run = (model: WalletModel, onTarget: (target: Web3ConnectionTarget) => void) => Promise<void>;

interface WalletsContext {
  picker: SolanaPicker;
  owner: WalletAction | undefined;
  run: Run;
  error: ErrorDescription | undefined;
}

type WalletsEvent =
  | { type: 'CONNECT'; provider: UserProfileWeb3Provider }
  | { type: 'VERIFY'; wallet: UserProfileWeb3Wallet }
  | { type: 'SET_PRIMARY'; walletId: string }
  | { type: 'CHOOSE'; walletName: string }
  | { type: 'TARGET'; target: Web3ConnectionTarget }
  | { type: 'CLOSE' };

interface RunInput {
  run: Run;
  onTarget: (target: Web3ConnectionTarget) => void;
}

function walletActors(model: WalletModel) {
  return {
    actors: {
      run: createAsyncLogic(({ input: { run, onTarget } }: AsyncArgs<RunInput>) => run(model, onTarget)),
    },
  };
}

function notSeated(): Promise<never> {
  return Promise.reject(new Error('web3 wallet run is not seated'));
}

const connection =
  (provider: UserProfileWeb3Provider, walletName?: string): Run =>
  (model, onTarget) =>
    model.connect(provider.id, walletName, onTarget);

const verification =
  (walletId: string, walletName?: string): Run =>
  model =>
    model.verify(walletId, walletName);

function actionKey(owner: WalletAction | undefined) {
  return owner?.kind === 'connect' ? owner.provider.id : owner?.walletId;
}

function connectionTarget(owner: WalletAction | undefined, wallets: UserProfileWeb3Wallet[]) {
  if (owner?.kind !== 'connect' || !owner.target) {
    return undefined;
  }
  const { provider, target } = owner;
  const matching = wallets.filter(wallet =>
    target.kind === 'wallet'
      ? wallet.id === target.id
      : wallet.providerId === provider.id && normalizedWeb3Wallet(wallet.address) === target.address,
  );
  return matching.length === 1 ? matching[0] : undefined;
}

function handsOffToWallet(owner: WalletAction | undefined) {
  return owner?.kind === 'connect' && owner.provider.walletPicker === 'solana' && owner.target?.kind === 'wallet';
}

function failure(cause: unknown): ErrorDescription | undefined {
  return isReverificationCancelledError(cause) ? undefined : toLocalizableError(cause);
}

type Settled = TransitionResult<WalletsContext, 'idle'>;

const { createMachine } = setup<WalletsContext, WalletsEvent>();

function runInput({ context, self }: InputArgs<WalletsContext, WalletsEvent>): RunInput {
  return { run: context.run, onTarget: target => self.send({ type: 'TARGET', target }) };
}

const walletsMachine = createMachine({
  id: 'web3Wallets',
  initial: 'idle',
  context: { picker: { open: false }, owner: undefined, run: notSeated, error: undefined },
  ...walletActors({ connect: notSeated, verify: notSeated, setPrimary: notSeated }),
  states: {
    idle: {
      on: {
        CONNECT: ({ event: { provider } }) => {
          const owner: WalletAction = { kind: 'connect', provider, target: null };
          return provider.walletPicker === 'solana'
            ? { context: { owner, error: undefined, picker: { open: true, kind: 'connect', provider } } }
            : { target: 'connecting', context: { owner, error: undefined, run: connection(provider) } };
        },
        VERIFY: ({ event: { wallet } }) => {
          const owner: WalletAction = { kind: 'verify', walletId: wallet.id };
          return wallet.walletPicker === 'solana'
            ? { context: { owner, error: undefined, picker: { open: true, kind: 'verify', walletId: wallet.id } } }
            : { target: 'verifying', context: { owner, error: undefined, run: verification(wallet.id) } };
        },
        SET_PRIMARY: ({ event: { walletId } }) => ({
          target: 'settingPrimary',
          context: {
            owner: { kind: 'primary', walletId },
            error: undefined,
            run: model => model.setPrimary(walletId),
          },
        }),
        CHOOSE: ({ context: { picker }, event: { walletName } }) => {
          if (!picker.open) {
            return undefined;
          }
          const chosen = walletName ? { ...picker, walletName } : picker;
          return picker.kind === 'connect'
            ? {
                target: 'connecting',
                context: {
                  owner: { kind: 'connect', provider: picker.provider, target: null },
                  picker: chosen,
                  run: connection(picker.provider, walletName),
                  error: undefined,
                },
              }
            : {
                target: 'verifying',
                context: {
                  owner: { kind: 'verify', walletId: picker.walletId },
                  picker: chosen,
                  run: verification(picker.walletId, walletName),
                  error: undefined,
                },
              };
        },
        CLOSE: () => ({ context: { picker: { open: false } } }),
      },
    },
    connecting: {
      on: {
        TARGET: ({ context: { owner }, event: { target } }) =>
          owner?.kind === 'connect' ? { context: { owner: { ...owner, target } } } : undefined,
      },
      invoke: {
        src: 'run',
        input: runInput,
        onDone: (): Settled => ({ target: 'idle', context: { picker: { open: false } } }),
        onError: ({ context: { picker, owner }, event }): Settled => ({
          target: 'idle',
          context: {
            error: failure(event.error),
            picker: handsOffToWallet(owner)
              ? { open: false }
              : picker.open && picker.kind === 'connect'
                ? { ...picker, walletName: undefined }
                : picker,
          },
        }),
      },
    },
    verifying: {
      invoke: {
        src: 'run',
        input: runInput,
        onDone: (): Settled => ({ target: 'idle', context: { picker: { open: false } } }),
        onError: ({ event }): Settled => ({
          target: 'idle',
          context: { error: failure(event.error), picker: { open: false } },
        }),
      },
    },
    settingPrimary: {
      invoke: {
        src: 'run',
        input: runInput,
        onDone: { target: 'idle' },
        onError: ({ event }): Settled => ({ target: 'idle', context: { error: failure(event.error) } }),
      },
    },
  },
});

export function useUserProfileWeb3WalletsController({
  wallets: modelWallets,
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
  const messages = useMessages('userProfile').web3Wallets;
  const [order] = useState(() => modelWallets.map(wallet => wallet.id));
  const wallets = applyOrder(order, modelWallets, wallet => wallet.id);
  const errorText = useErrorText();
  const [{ value, context }, send] = useMachine(walletsMachine.provide(walletActors({ connect, verify, setPrimary })));
  const { owner } = context;
  const isBusy = value !== 'idle';
  const error = context.error ? errorText(context.error, messages.errors.generic) : undefined;
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
    onConfirm: wallet => removalFocus.remove(wallet.id),
    reverification: removeReverification,
  });

  const onConnect = (id: string) => {
    const provider = availableProviders.find(candidate => candidate.id === id);
    if (provider) {
      send({ type: 'CONNECT', provider });
    }
  };

  const onVerify = (walletId: string) => {
    const wallet = wallets.find(candidate => candidate.id === walletId && candidate.canVerify);
    if (wallet) {
      send({ type: 'VERIFY', wallet });
    }
  };

  const targetWallet = connectionTarget(owner, wallets);
  const picker: SolanaPicker = handsOffToWallet(owner) && targetWallet ? { open: false } : context.picker;
  const ownerId = targetWallet?.id ?? actionKey(owner);
  const errorKey = actionKey(owner);
  const pendingId = isBusy ? ownerId : undefined;
  const errorId = error ? ownerId : undefined;
  const actionFinalFocus = () => (ownerId ? removalFocus.trigger(ownerId) : null);

  return {
    wallets: wallets.map(wallet => {
      const isPending = pendingId === wallet.id;
      const row = {
        ...wallet,
        isPending,
        isPrimaryPending: isPending && owner?.kind === 'primary' && !setPrimaryReverification.visible,
      };
      return errorId === wallet.id
        ? owner?.kind === 'primary'
          ? { ...row, primaryError: error }
          : { ...row, verifyError: error }
        : row;
    }),
    availableProviders: availableProviders.map(provider => {
      const row = { ...provider, isPending: pendingId === provider.id };
      return errorId === provider.id &&
        (!picker.open || picker.kind !== 'connect' || picker.provider.id !== provider.id)
        ? { ...row, connectError: error }
        : row;
    }),
    error:
      !picker.open &&
      errorId &&
      !wallets.some(wallet => wallet.id === errorId) &&
      !availableProviders.some(provider => provider.id === errorId)
        ? error
        : undefined,
    isDisabled: isBusy || removeWallet.isPending,
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
      error &&
      (picker.kind === 'connect' ? picker.provider.id === errorKey : picker.walletId === errorKey)
        ? error
        : undefined,
    pendingWalletName: picker.open ? picker.walletName : undefined,
    onConnect,
    onVerify,
    onSetPrimary: (walletId: string) => send({ type: 'SET_PRIMARY', walletId }),
    connectSolana: (walletName: string) => send({ type: 'CHOOSE', walletName }),
    closeSolanaPicker: () => send({ type: 'CLOSE' }),
  };
}
