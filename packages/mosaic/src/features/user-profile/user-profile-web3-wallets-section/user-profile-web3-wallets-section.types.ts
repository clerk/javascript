import type { Web3Strategy } from '@clerk/shared/types';

export interface UserProfileWeb3Provider {
  id: Web3Strategy;
  walletPicker?: 'solana';
  provider: string;
  iconUrl?: string;
  connectError?: string;
}

export interface UserProfileWeb3Wallet {
  id: string;
  address: string;
  provider?: string;
  iconUrl?: string;
  isPrimary?: boolean;
  isVerified: boolean;
  canRemove?: boolean;
  primaryError?: string;
}

export interface UserProfileWeb3WalletsSectionViewProps {
  fallbackFocus?: () => HTMLElement | null;
  wallets: UserProfileWeb3Wallet[];
  availableProviders?: UserProfileWeb3Provider[];
  pendingId?: string;
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

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
