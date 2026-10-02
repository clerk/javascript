import type { ReactNode } from 'react';

import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';
import { UserProfileSolanaWalletDialog } from './user-profile-solana-wallet.dialog';
import { useUserProfileWeb3WalletsController } from './user-profile-web3-wallets-section.controller';
import { useUserProfileWeb3WalletsModel } from './user-profile-web3-wallets-section.model';
import type { ReadyWeb3WalletsModel } from './user-profile-web3-wallets-section.types';

export interface UserProfileWeb3WalletsSectionProps {
  fallback?: ReactNode;
  fallbackFocus?: () => HTMLElement | null;
}

export function UserProfileWeb3WalletsSection({ fallback, fallbackFocus }: UserProfileWeb3WalletsSectionProps) {
  const model = useUserProfileWeb3WalletsModel();
  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <Web3Wallets
      key={model.userId}
      model={model}
      fallbackFocus={fallbackFocus}
    />
  );
}

function Web3Wallets({
  model,
  fallbackFocus,
}: {
  model: ReadyWeb3WalletsModel;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const controller = useUserProfileWeb3WalletsController(model);
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
        onRemove={model.remove}
      />
      <UserProfileSolanaWalletDialog
        open={controller.solanaPickerOpen}
        pendingWalletName={controller.pendingWalletName}
        error={controller.solanaPickerError}
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
