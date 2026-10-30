import type { ReactNode } from 'react';

import { UserProfileSolanaWalletDialog } from './user-profile-solana-wallet.dialog';
import { useUserProfileWeb3WalletsController } from './user-profile-web3-wallets-section.controller';
import { useUserProfileWeb3WalletsModel } from './user-profile-web3-wallets-section.model';
import type { ReadyWeb3WalletsModel } from './user-profile-web3-wallets-section.types';
import { UserProfileWeb3WalletsSectionView } from './user-profile-web3-wallets-section.view';

export interface UserProfileWeb3WalletsSectionProps {
  fallback?: ReactNode;
}

export function UserProfileWeb3WalletsSection({ fallback }: UserProfileWeb3WalletsSectionProps) {
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
    />
  );
}

function Web3Wallets({ model }: { model: ReadyWeb3WalletsModel }) {
  const controller = useUserProfileWeb3WalletsController(model);
  return (
    <>
      <UserProfileWeb3WalletsSectionView
        wallets={controller.wallets}
        sectionRef={controller.sectionRef}
        availableProviders={controller.availableProviders}
        pendingId={controller.pendingId}
        error={controller.error}
        onConnect={id => {
          void controller.onConnect(id);
        }}
        onCancelConnection={controller.onCancelConnection}
        onVerify={id => {
          void controller.onVerify(id);
        }}
        onSetPrimary={id => {
          void controller.onSetPrimary(id);
        }}
        registerTrigger={controller.registerTrigger}
        remove={controller.remove}
        finalFocus={controller.finalFocus}
        setPrimaryReverification={controller.setPrimaryReverification}
        setPrimaryFinalFocus={controller.setPrimaryFinalFocus}
        createReverification={controller.createReverification}
        createFinalFocus={controller.createFinalFocus}
      />
      <UserProfileSolanaWalletDialog
        open={controller.solanaPickerOpen}
        finalFocus={controller.solanaFinalFocus}
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
