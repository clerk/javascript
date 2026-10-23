import { UserProfilePasskeysSectionView } from '../../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.view';
import { useLoomProfilePasskeysModel } from './loom-profile-passkeys.model';

export function LoomProfilePasskeys() {
  const state = useLoomProfilePasskeysModel();
  return state ? (
    <UserProfilePasskeysSectionView
      passkeys={state.passkeys}
      addEligible={state.addEligible}
      actionsEligible
    />
  ) : null;
}
