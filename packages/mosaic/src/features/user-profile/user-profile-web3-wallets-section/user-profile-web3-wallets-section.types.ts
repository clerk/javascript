import type { Web3Strategy } from '@clerk/shared/types';
import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { ReverificationController } from '../../reverification';

export interface UserProfileWeb3Provider {
  id: Web3Strategy;
  walletPicker?: 'solana';
  provider: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
  connectError?: string;
}

export interface UserProfileWeb3Wallet {
  id: string;
  address: string;
  providerId?: Web3Strategy;
  walletPicker?: 'solana';
  canVerify?: boolean;
  provider?: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
  isPrimary?: boolean;
  isVerified: boolean;
  canRemove?: boolean;
  primaryError?: string;
  verifyError?: string;
}

export interface UserProfileWeb3WalletsSectionViewProps {
  wallets: UserProfileWeb3Wallet[];
  sectionRef?: Ref<HTMLDivElement>;
  availableProviders?: UserProfileWeb3Provider[];
  pendingId?: string;
  error?: string;
  onConnect?: (id: string) => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfileWeb3Wallet>;
  finalFocus?: DialogFocusTarget;
  setPrimaryReverification?: ReverificationController;
  setPrimaryFinalFocus?: DialogFocusTarget;
  createReverification?: ReverificationController;
  createFinalFocus?: DialogFocusTarget;
}

export type UserProfileWeb3WalletsModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      wallets: UserProfileWeb3Wallet[];
      availableProviders: UserProfileWeb3Provider[];
      connect: (
        strategy: Web3Strategy,
        walletName?: string,
        onTarget?: (target: Web3ConnectionTarget) => void,
      ) => Promise<void>;
      verify: (walletId: string, walletName?: string) => Promise<void>;
      setPrimary: (walletId: string) => Promise<void>;
      remove?: (walletId: string) => Promise<void>;
      removeReverification: ReverificationController;
      setPrimaryReverification: ReverificationController;
      createReverification: ReverificationController;
    };

export type ReadyWeb3WalletsModel = Extract<UserProfileWeb3WalletsModel, { status: 'ready' }>;

export type Web3ConnectionTarget = { kind: 'address'; address: string } | { kind: 'wallet'; id: string };
