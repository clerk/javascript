import { passkeysSectionNode } from '../../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section';
import { UserProfilePasskeysSectionView } from '../../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.view';
import { useLoomProfilePasskeysModel } from './loom-profile-passkeys.model';

export function LoomProfilePasskeys() {
  const state = useLoomProfilePasskeysModel();
  if (!state) {
    return null;
  }
  if (state.kind === 'snapshot') {
    return (
      <UserProfilePasskeysSectionView
        passkeys={state.passkeys}
        addEligible={state.addEligible}
        actionsEligible
      />
    );
  }
  return passkeysSectionNode(state.model);
}
