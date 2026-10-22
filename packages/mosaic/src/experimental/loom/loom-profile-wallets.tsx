import { useLoom } from '@clerk/loom/react';

import { Web3Wallets } from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section';
import { UserProfileWeb3WalletsSectionView } from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.view';
import { useLoomProfileWalletsModel } from './loom-profile-wallets.model';

export function LoomProfileWallets() {
  const client = useLoom();
  const state = useLoomProfileWalletsModel();
  if (!state) {
    return null;
  }
  if (state.kind === 'snapshot') {
    return (
      <UserProfileWeb3WalletsSectionView
        wallets={state.wallets}
        availableProviders={state.availableProviders}
        actionsEligible
      />
    );
  }
  return (
    <Web3Wallets
      key={`${client.scope.instanceKey}:${client.scope.userId}:${client.scope.sessionId}`}
      model={state.model}
    />
  );
}
