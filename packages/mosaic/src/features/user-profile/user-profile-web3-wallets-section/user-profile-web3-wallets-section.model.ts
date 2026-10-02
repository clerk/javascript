import { iconImageUrl } from '@clerk/shared/constants';
import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import { useClerk, useUser } from '@clerk/shared/react';
import type { VerificationResource, Web3WalletResource } from '@clerk/shared/types';
import { sortIdentificationBasedOnVerification } from '@clerk/shared/utils';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useErrorText, useMessages } from '../../../localization';
import { allowsIdentificationCreation } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section.model';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.view';
import { web3WalletFeedback } from './user-profile-web3-wallets-feedback';
import type { UserProfileWeb3WalletsModel } from './user-profile-web3-wallets-section.types';
import { Web3WalletActionError } from './user-profile-web3-wallets-section.types';

export type Web3WalletEntry = Pick<Web3WalletResource, 'id' | 'web3Wallet'> & {
  verification: Pick<VerificationResource, 'strategy' | 'status' | 'expireAt'>;
};

export type Web3WalletsProjection =
  | { status: 'hidden' }
  | { status: 'ready'; wallets: UserProfileWeb3Wallet[]; availableProviders: UserProfileWeb3Provider[] };

export function projectWeb3Wallets({
  wallets,
  primaryId,
  enabledStrategies,
  allowCreation,
}: {
  wallets: readonly Web3WalletEntry[];
  primaryId: string | null;
  enabledStrategies: readonly string[];
  allowCreation: boolean;
}): Web3WalletsProjection {
  if (!allowCreation && wallets.length === 0) {
    return { status: 'hidden' };
  }

  const providers = WEB3_PROVIDERS.filter(provider => enabledStrategies.includes(provider.strategy));
  const knownWallets = wallets.filter(
    wallet =>
      wallet.verification.strategy === 'admin' ||
      WEB3_PROVIDERS.some(provider => provider.strategy === wallet.verification.strategy),
  );
  const sorted = sortIdentificationBasedOnVerification(knownWallets, primaryId);

  const connectedStrategies = new Set(
    wallets.filter(wallet => wallet.verification.status === 'verified').map(wallet => wallet.verification.strategy),
  );

  return {
    status: 'ready',
    wallets: sorted.map(wallet => {
      const provider = WEB3_PROVIDERS.find(candidate => candidate.strategy === wallet.verification.strategy);
      return {
        id: wallet.id,
        address: wallet.web3Wallet,
        provider: provider?.name,
        iconUrl: provider ? iconImageUrl(provider.provider) : undefined,
        isPrimary: wallet.id === primaryId,
        isVerified: wallet.verification.status === 'verified',
      };
    }),
    availableProviders: allowCreation
      ? providers
          .filter(provider => !connectedStrategies.has(provider.strategy))
          .map(provider => ({
            id: provider.strategy,
            walletPicker: provider.provider === 'solana' ? 'solana' : undefined,
            provider: provider.name,
            iconUrl: iconImageUrl(provider.provider),
          }))
      : [],
  };
}

export function useUserProfileWeb3WalletsModel(): UserProfileWeb3WalletsModel {
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const environment = useMosaicEnvironment();
  const messages = useMessages('userProfileWeb3Wallets');
  const errorText = useErrorText();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user || !environment.userSettings.attributes.web3_wallet?.enabled) {
    return { status: 'hidden' };
  }
  const projection = projectWeb3Wallets({
    wallets: user.web3Wallets,
    primaryId: user.primaryWeb3WalletId,
    enabledStrategies: environment.userSettings.web3FirstFactors,
    allowCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
  });
  if (projection.status === 'hidden') {
    return projection;
  }
  const userId = user.id;
  const requireCurrentUser = () => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw new Web3WalletActionError('providerUnavailable');
    }
    return current;
  };
  const runAction = async (action: () => Promise<void>): Promise<void> => {
    try {
      await action();
    } catch (error) {
      throw web3WalletFeedback(error, messages, errorText);
    }
  };

  return {
    ...projection,
    userId,
    connect: (strategy, walletName) =>
      runAction(async () => {
        requireCurrentUser();
        const provider = WEB3_PROVIDERS.find(candidate => candidate.strategy === strategy);
        const available = projection.availableProviders.some(candidate => candidate.id === strategy);
        const manager = clerk.__internal_moduleManager;
        if (!provider || !available || !manager) {
          throw new Web3WalletActionError('providerUnavailable');
        }
        const web3 = createWeb3(manager);
        const identifier = await web3.getWeb3Identifier({ provider: provider.provider, walletName });
        if (!identifier) {
          throw new Web3WalletActionError('extensionUnavailable');
        }
        const wallet = await requireCurrentUser().createWeb3Wallet({ web3Wallet: identifier });
        requireCurrentUser();
        if (!wallet) {
          throw new Web3WalletActionError('creationFailed');
        }
        const prepared = await wallet.prepareVerification({ strategy: provider.strategy });
        requireCurrentUser();
        const nonce = prepared.verification.message;
        if (!nonce) {
          throw new Web3WalletActionError('messageUnavailable');
        }
        const signature = await web3.generateWeb3Signature({
          identifier,
          nonce,
          provider: provider.provider,
          walletName,
        });
        requireCurrentUser();
        if (!signature) {
          throw new Web3WalletActionError('signatureUnavailable');
        }
        await prepared.attemptVerification({ signature });
      }),
    setPrimary: walletId =>
      runAction(async () => {
        const current = requireCurrentUser();
        if (!current.web3Wallets.some(wallet => wallet.id === walletId && wallet.verification.status === 'verified')) {
          throw new Web3WalletActionError('providerUnavailable');
        }
        await current.update({ primaryWeb3WalletId: walletId });
      }),
    remove: walletId =>
      runAction(async () => {
        const wallet = requireCurrentUser().web3Wallets.find(wallet => wallet.id === walletId);
        if (!wallet) {
          throw new Web3WalletActionError('providerUnavailable');
        }
        await wallet.destroy();
      }),
  };
}
