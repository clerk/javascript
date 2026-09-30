import { isClerkAPIResponseError } from '@clerk/shared/error';
import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import { useClerk, useUser } from '@clerk/shared/react';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';
import type { ReactNode } from 'react';

import { useMosaicEnvironment } from '../../../hooks/useMosaicEnvironment';
import { useMessages } from '../../../localization';
import { allowsIdentificationCreation } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';
import { UserProfileSolanaWalletDialog } from './user-profile-solana-wallet.dialog';
import { useUserProfileWeb3WalletsController } from './user-profile-web3-wallets-section.controller';
import { projectWeb3Wallets } from './user-profile-web3-wallets-section.model';

export interface UserProfileWeb3WalletsSectionProps {
  fallback?: ReactNode;
  fallbackFocus?: () => HTMLElement | null;
}

// TODO: Adopt the shared localized error handling from #9844 once it lands on main,
// preserving Clerk error codes for wallet-signature failures.
function actionError(error: unknown, fallbackMessage: string): Error {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return new Error(first?.longMessage || first?.message || fallbackMessage);
  }
  return new Error(error instanceof Error && error.message ? error.message : fallbackMessage);
}

export function UserProfileWeb3WalletsSection({ fallback, fallbackFocus }: UserProfileWeb3WalletsSectionProps) {
  const m = useMessages('userProfileWeb3Wallets');
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
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

  // TODO: Add session reverification for wallet connection, primary updates, and removal;
  // surface API errors until then.
  const connect = async (strategy: string, walletName?: string) => {
    const provider = WEB3_PROVIDERS.find(candidate => candidate.strategy === strategy);
    const manager = clerk.__internal_moduleManager;
    if (!provider || !manager || !user) {
      throw new Error(m.errors.providerUnavailable);
    }

    try {
      const web3 = createWeb3(manager);
      const identifier = await web3.getWeb3Identifier({ provider: provider.provider, walletName });
      if (!identifier) {
        throw new Error(m.errors.extensionUnavailable);
      }
      const wallet = await user.createWeb3Wallet({ web3Wallet: identifier });
      if (!wallet) {
        throw new Error(m.errors.creationFailed);
      }
      const prepared = await wallet.prepareVerification({ strategy: provider.strategy });
      const nonce = prepared.verification.message;
      if (!nonce) {
        throw new Error(m.errors.messageUnavailable);
      }
      const signature = await web3.generateWeb3Signature({
        identifier,
        nonce,
        provider: provider.provider,
        walletName,
      });
      if (!signature) {
        throw new Error(m.errors.signatureUnavailable);
      }
      await prepared.attemptVerification({ signature });
    } catch (error) {
      throw actionError(error, m.errors.generic);
    }
  };

  const setPrimary = async (walletId: string) => {
    if (!user?.web3Wallets.some(wallet => wallet.id === walletId && wallet.verification.status === 'verified')) {
      return;
    }
    try {
      await user.update({ primaryWeb3WalletId: walletId });
    } catch (error) {
      throw actionError(error, m.errors.generic);
    }
  };

  const remove = async (walletId: string) => {
    try {
      await user?.web3Wallets.find(wallet => wallet.id === walletId)?.destroy();
    } catch (error) {
      throw actionError(error, m.errors.generic);
    }
  };

  const controller = useUserProfileWeb3WalletsController({
    wallets: projection.status === 'ready' ? projection.wallets : [],
    availableProviders: projection.status === 'ready' ? projection.availableProviders : [],
    connect,
    setPrimary,
    fallbackErrorMessage: m.errors.generic,
  });

  if (!isLoaded || !environment) {
    return fallback ?? null;
  }
  if (!environment.userSettings.attributes.web3_wallet?.enabled) {
    return null;
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
      />
      <UserProfileSolanaWalletDialog
        open={controller.solanaPickerOpen}
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
    </>
  );
}
