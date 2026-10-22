import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import type { Web3Strategy } from '@clerk/shared/types';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';

import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActions } from './profile-actions-types';
import type { ProfileEnvironment } from './profile-host-types';

function normalizedIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  return /^0x/i.test(trimmed) ? trimmed.toLowerCase() : trimmed;
}

export function walletActions(
  host: ClerkSessionsHost,
  owner: LoomClient,
  current: () => NonNullable<ClerkSessionsHost['user']>,
  environment: () => ProfileEnvironment,
  canAdd: () => boolean,
): ProfileActions['wallet'] {
  const attribute = environment().userSettings.attributes.web3_wallet;
  const user = current();
  const enabled = Boolean(attribute?.enabled);
  const wallet = (id: string) => {
    const target = current().web3Wallets?.find(item => item.id === id);
    if (!target || !environment().userSettings.attributes.web3_wallet?.enabled) {
      throw new Error('Wallet unavailable.');
    }
    return target;
  };
  const strategyAvailable = (strategy: Web3Strategy) => {
    const target = current();
    const policy = environment().userSettings;
    return Boolean(
      policy.attributes.web3_wallet?.enabled &&
      !policy.attributes.web3_wallet.immutable &&
      canAdd() &&
      policy.web3FirstFactors?.includes(strategy) &&
      !target.web3Wallets?.some(
        item => item.verification.status === 'verified' && item.verification.strategy === strategy,
      ),
    );
  };
  const mutate = (operation: () => Promise<unknown>) =>
    owner.mutateProfile(async () => {
      current();
      await operation();
      current();
    });
  return {
    available: enabled && Boolean(user.web3Wallets),
    connect:
      enabled && !attribute?.immutable && canAdd() && host.__internal_moduleManager && user.createWeb3Wallet
        ? (strategy, walletName) =>
            mutate(async () => {
              const provider = WEB3_PROVIDERS.find(item => item.strategy === strategy);
              const manager = host.__internal_moduleManager;
              if (!provider || !manager || !strategyAvailable(strategy)) {
                throw new Error('Wallet provider unavailable.');
              }
              const web3 = createWeb3(manager);
              const identifier = await web3.getWeb3Identifier({ provider: provider.provider, walletName });
              current();
              if (!identifier) {
                throw new Error('A Web3 Wallet extension cannot be found.');
              }
              if (!strategyAvailable(strategy)) {
                throw new Error('Wallet provider unavailable.');
              }
              const target = current();
              const existing = target.web3Wallets?.find(
                item =>
                  item.verification.status !== 'verified' &&
                  normalizedIdentifier(item.web3Wallet) === normalizedIdentifier(identifier),
              );
              if (!target.createWeb3Wallet) {
                throw new Error('Wallet creation unavailable.');
              }
              const created = existing ?? (await target.createWeb3Wallet({ web3Wallet: identifier }));
              current();
              const prepared = await created.prepareVerification({ strategy: provider.strategy });
              current();
              const nonce = prepared.verification.message;
              if (!nonce) {
                throw new Error('Wallet verification message unavailable.');
              }
              const signature = await web3.generateWeb3Signature({
                identifier,
                nonce,
                provider: provider.provider,
                walletName,
              });
              current();
              if (!signature) {
                throw new Error('Wallet signature unavailable.');
              }
              await prepared.attemptVerification({ signature });
              current();
            })
        : undefined,
    setPrimary:
      enabled && user.update
        ? id =>
            mutate(async () => {
              if (wallet(id).verification.status !== 'verified') {
                throw new Error('Wallet unavailable.');
              }
              const target = current();
              if (!target.update) {
                throw new Error('Wallet selection unavailable.');
              }
              await target.update({ primaryWeb3WalletId: id });
            })
        : undefined,
    remove:
      enabled && !attribute?.immutable && user.web3Wallets
        ? id =>
            mutate(async () => {
              if (environment().userSettings.attributes.web3_wallet?.immutable) {
                throw new Error('Wallet removal unavailable.');
              }
              await wallet(id).destroy();
            })
        : undefined,
  };
}
