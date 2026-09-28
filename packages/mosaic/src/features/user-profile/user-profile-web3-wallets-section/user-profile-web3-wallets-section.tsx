import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import { useClerk, useUser } from '@clerk/shared/react';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';
import { type ReactNode, useRef } from 'react';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { currentInteractionOrigin } from '../../../primitives/utils/interaction-origin';
import { ReverificationDialog, useReverificationFlow } from '../../reverification';
import { allowsIdentificationCreation } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';
import { UserProfileSolanaWalletDialog } from './user-profile-solana-wallet.dialog';
import { useUserProfileWeb3WalletsController } from './user-profile-web3-wallets-section.controller';
import { projectWeb3Wallets } from './user-profile-web3-wallets-section.model';

export interface UserProfileWeb3WalletsSectionProps {
  fallback?: ReactNode;
  fallbackFocus?: () => HTMLElement | null;
}

function actionError(error: unknown): unknown {
  if (isReverificationCancelledError(error)) {
    return error;
  }
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return new Error(first?.longMessage || first?.message || 'Something went wrong. Please try again.');
  }
  return new Error(error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.');
}

export function UserProfileWeb3WalletsSection({ fallback, fallbackFocus }: UserProfileWeb3WalletsSectionProps) {
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const reverificationFocus = useRef<HTMLElement | null>(null);
  const captureReverificationFocus = () => {
    const active = document.activeElement;
    reverificationFocus.current = currentInteractionOrigin() ?? (active instanceof HTMLElement ? active : null);
  };
  const [createWallet, createReverification] = useReverificationFlow((address: string) =>
    user?.createWeb3Wallet({ web3Wallet: address }),
  );
  const [updatePrimary, primaryReverification] = useReverificationFlow((walletId: string) =>
    user?.update({ primaryWeb3WalletId: walletId }),
  );

  const [destroyWallet, removeReverification] = useReverificationFlow((walletId: string) =>
    user?.web3Wallets.find(wallet => wallet.id === walletId)?.destroy(),
  );

  const projection =
    user && environment
      ? projectWeb3Wallets({
          wallets: user.web3Wallets.map(wallet => ({
            id: wallet.id,
            address: wallet.web3Wallet,
            strategy: wallet.verification.strategy ?? '',
            status: wallet.verification.status,
            expireAt: wallet.verification.expireAt,
          })),
          primaryId: user.primaryWeb3WalletId,
          enabledStrategies: environment.userSettings.web3FirstFactors,
          allowCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
        })
      : ({ status: 'hidden' } as const);

  const connect = async (strategy: string, walletName?: string) => {
    captureReverificationFocus();
    const provider = WEB3_PROVIDERS.find(candidate => candidate.strategy === strategy);
    const manager = clerk.__internal_moduleManager;
    if (!provider || !manager || !user) {
      throw new Error('This wallet provider is unavailable.');
    }

    try {
      const web3 = createWeb3(manager);
      const identifier = await web3.getWeb3Identifier({ provider: provider.provider, walletName });
      if (!identifier) {
        throw new Error('A Web3 Wallet extension cannot be found. Please install one to continue.');
      }
      const wallet = await createWallet(identifier);
      if (!wallet) {
        throw new Error('The wallet could not be created.');
      }
      const prepared = await wallet.prepareVerification({ strategy: provider.strategy });
      const nonce = prepared.verification.message;
      if (!nonce) {
        throw new Error('The wallet verification message is unavailable.');
      }
      const signature = await web3.generateWeb3Signature({
        identifier,
        nonce,
        provider: provider.provider,
        walletName,
      });
      if (!signature) {
        throw new Error('The wallet signature is unavailable.');
      }
      await prepared.attemptVerification({ signature });
    } catch (error) {
      throw actionError(error);
    }
  };

  const setPrimary = async (walletId: string) => {
    captureReverificationFocus();
    if (!user?.web3Wallets.some(wallet => wallet.id === walletId && wallet.verification.status === 'verified')) {
      return;
    }
    try {
      await updatePrimary(walletId);
    } catch (error) {
      throw actionError(error);
    }
  };

  const remove = async (walletId: string) => {
    try {
      await destroyWallet(walletId);
    } catch (error) {
      throw actionError(error);
    }
  };

  const controller = useUserProfileWeb3WalletsController({
    wallets: projection.status === 'ready' ? projection.wallets : [],
    availableProviders: projection.status === 'ready' ? projection.availableProviders : [],
    connect,
    setPrimary,
  });

  if (!isLoaded || !environment) {
    return fallback ?? null;
  }
  if (projection.status === 'hidden') {
    return null;
  }

  return (
    <>
      <UserProfileWeb3WalletsSectionView
        fallbackFocus={fallbackFocus}
        wallets={controller.wallets}
        availableProviders={controller.availableProviders}
        pendingId={controller.pendingId}
        onConnect={id => {
          void controller.onConnect(id);
        }}
        onSetPrimary={id => {
          void controller.onSetPrimary(id);
        }}
        onRemove={remove}
        removeReverification={removeReverification}
      />
      <UserProfileSolanaWalletDialog
        open={controller.solanaPickerOpen}
        reverification={createReverification}
        pending={controller.pendingId === 'web3_solana_signature'}
        error={controller.availableProviders.find(provider => provider.id === 'web3_solana_signature')?.connectError}
        onOpenChange={open => {
          if (!open) {
            controller.closeSolanaPicker();
          }
        }}
        onConnect={walletName => {
          void controller.connectSolana(walletName);
        }}
      />
      {!controller.solanaPickerOpen ? (
        <ReverificationDialog
          {...createReverification}
          finalFocus={reverificationFocus}
        />
      ) : null}
      <ReverificationDialog
        {...primaryReverification}
        finalFocus={reverificationFocus}
      />
    </>
  );
}
