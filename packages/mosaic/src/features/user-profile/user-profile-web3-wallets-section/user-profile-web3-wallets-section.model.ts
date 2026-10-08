import { iconImageUrl } from '@clerk/shared/constants';
import { ClerkRuntimeError } from '@clerk/shared/error';
import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import { useClerk, useUser } from '@clerk/shared/react';
import type { VerificationResource, Web3WalletResource } from '@clerk/shared/types';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { allowsIdentificationCreation } from '../../../utils/allows-identification-creation';
import type {
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
  UserProfileWeb3WalletsModel,
} from './user-profile-web3-wallets-section.types';

export type Web3WalletEntry = Pick<Web3WalletResource, 'id' | 'web3Wallet'> & {
  verification: Pick<VerificationResource, 'strategy' | 'status' | 'expireAt'>;
};

export type Web3WalletsProjection =
  | { status: 'hidden' }
  | { status: 'ready'; wallets: UserProfileWeb3Wallet[]; availableProviders: UserProfileWeb3Provider[] };

export function normalizedWeb3Wallet(identifier: string): string {
  const trimmed = identifier.trim();
  return /^0x/i.test(trimmed) ? trimmed.toLowerCase() : trimmed;
}

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
  const primary = knownWallets.filter(wallet => wallet.id === primaryId);
  const remaining = knownWallets.filter(wallet => wallet.id !== primaryId);
  const verified = remaining.filter(wallet => wallet.verification.status === 'verified');
  const unverified = remaining.filter(
    wallet => wallet.verification.status !== null && wallet.verification.status !== 'verified',
  );
  const withoutStatus = remaining.filter(wallet => wallet.verification.status === null);

  verified.sort((first, second) => first.id.localeCompare(second.id));
  unverified.sort((first, second) => {
    const firstExpiry = first.verification.expireAt;
    const secondExpiry = second.verification.expireAt;
    return firstExpiry && secondExpiry ? firstExpiry.getTime() - secondExpiry.getTime() : 0;
  });

  const sorted = [...primary, ...verified, ...unverified, ...withoutStatus];

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

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user || !environment.userSettings.attributes.web3_wallet?.enabled) {
    return { status: 'hidden' };
  }
  const web3Attribute = environment.userSettings.attributes.web3_wallet;
  const projection = projectWeb3Wallets({
    wallets: user.web3Wallets,
    primaryId: user.primaryWeb3WalletId,
    enabledStrategies: environment.userSettings.web3FirstFactors,
    allowCreation:
      !web3Attribute.immutable && allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
  });
  if (projection.status === 'hidden') {
    return projection;
  }
  const userId = user.id;
  const requireCurrentUser = () => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw new ClerkRuntimeError('This wallet provider is unavailable.', { code: 'web3_provider_unavailable' });
    }
    return current;
  };
  return {
    ...projection,
    userId,
    connect: async (strategy, walletName) => {
      requireCurrentUser();
      const provider = WEB3_PROVIDERS.find(candidate => candidate.strategy === strategy);
      const available = projection.availableProviders.some(candidate => candidate.id === strategy);
      const manager = clerk.__internal_moduleManager;
      if (!provider || !available || !manager) {
        throw new ClerkRuntimeError('This wallet provider is unavailable.', { code: 'web3_provider_unavailable' });
      }
      const web3 = createWeb3(manager);
      const identifier = await web3.getWeb3Identifier({ provider: provider.provider, walletName });
      if (!identifier) {
        throw new ClerkRuntimeError('A Web3 Wallet extension cannot be found.', { code: 'web3_missing_identifier' });
      }
      const current = requireCurrentUser();
      const currentProjection = projectWeb3Wallets({
        wallets: current.web3Wallets,
        primaryId: current.primaryWeb3WalletId,
        enabledStrategies: environment.userSettings.web3FirstFactors,
        allowCreation:
          Boolean(environment.userSettings.attributes.web3_wallet?.enabled) &&
          !environment.userSettings.attributes.web3_wallet?.immutable &&
          allowsIdentificationCreation(current, environment.userSettings.enterpriseSSO),
      });
      if (
        currentProjection.status !== 'ready' ||
        !currentProjection.availableProviders.some(candidate => candidate.id === strategy)
      ) {
        throw new ClerkRuntimeError('This wallet provider is unavailable.', { code: 'web3_provider_unavailable' });
      }
      const normalizedIdentifier = normalizedWeb3Wallet(identifier);
      const existing = current.web3Wallets.find(
        wallet =>
          wallet.verification.status !== 'verified' && normalizedWeb3Wallet(wallet.web3Wallet) === normalizedIdentifier,
      );
      const wallet = existing ?? (await current.createWeb3Wallet({ web3Wallet: identifier }));
      requireCurrentUser();
      if (!wallet) {
        throw new ClerkRuntimeError('The wallet could not be created.', { code: 'web3_wallet_creation_failed' });
      }
      const prepared = await wallet.prepareVerification({ strategy: provider.strategy });
      requireCurrentUser();
      const nonce = prepared.verification.message;
      if (!nonce) {
        throw new ClerkRuntimeError('The wallet verification message is unavailable.', {
          code: 'web3_verification_message_unavailable',
        });
      }
      const signature = await web3.generateWeb3Signature({
        identifier,
        nonce,
        provider: provider.provider,
        walletName,
      });
      requireCurrentUser();
      if (!signature) {
        throw new ClerkRuntimeError('The wallet signature is unavailable.', { code: 'web3_signature_unavailable' });
      }
      await prepared.attemptVerification({ signature });
    },
    setPrimary: async walletId => {
      const current = requireCurrentUser();
      if (!current.web3Wallets.some(wallet => wallet.id === walletId && wallet.verification.status === 'verified')) {
        throw new ClerkRuntimeError('This wallet provider is unavailable.', { code: 'web3_provider_unavailable' });
      }
      await current.update({ primaryWeb3WalletId: walletId });
    },
    remove: web3Attribute.immutable
      ? undefined
      : async walletId => {
          if (environment.userSettings.attributes.web3_wallet?.immutable) {
            throw new ClerkRuntimeError('This wallet provider is unavailable.', { code: 'web3_provider_unavailable' });
          }
          const wallet = requireCurrentUser().web3Wallets.find(wallet => wallet.id === walletId);
          if (!wallet) {
            throw new ClerkRuntimeError('This wallet provider is unavailable.', { code: 'web3_provider_unavailable' });
          }
          await wallet.destroy();
        },
  };
}
