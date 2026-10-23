import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { UserProfileMfaSectionView } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.view';
import { useMessages } from '../../localization';
import { useLoomProfileMfaModel } from './loom-profile-mfa.model';

export function LoomProfileMfa() {
  const state = useLoomProfileMfaModel();
  const m = useMessages('userProfileMfa');
  return state ? (
    <UserProfileMfaSectionView
      methods={[...state.methods]}
      addableMethods={state.addableMethods}
      actionsEligible
      addControl={state.addableMethods.length > 0 ? (
        <Button aria-label={m.addLabel} color='neutral' size='sm' variant='outline' disabled>
          <Icon name='plus' placement='inline-start' size='sm' />
          {m.add}
        </Button>
      ) : undefined}
    />
  ) : null;
}
