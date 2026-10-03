import type { Web3Strategy } from '@clerk/shared/types';

import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.view';

export type UserProfileWeb3WalletsModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      wallets: UserProfileWeb3Wallet[];
      availableProviders: UserProfileWeb3Provider[];
      connect: (strategy: Web3Strategy, walletName?: string) => Promise<void>;
      setPrimary: (walletId: string) => Promise<void>;
      remove?: (walletId: string) => Promise<void>;
    };

export type ReadyWeb3WalletsModel = Extract<UserProfileWeb3WalletsModel, { status: 'ready' }>;

export class Web3WalletActionError extends Error {
  constructor(
    readonly code:
      | 'providerUnavailable'
      | 'extensionUnavailable'
      | 'creationFailed'
      | 'messageUnavailable'
      | 'signatureUnavailable',
    message: string = code,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'Web3WalletActionError';
  }
}
