import { UserProfileWeb3WalletsSectionView } from '../../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.view';
import { useLoomProfileWalletsModel } from './loom-profile-wallets.model';

export function LoomProfileWallets() {
  const state = useLoomProfileWalletsModel();
  return state ? (
    <UserProfileWeb3WalletsSectionView
      wallets={state.wallets}
      availableProviders={state.availableProviders}
      actionsEligible
    />
  ) : null;
}
