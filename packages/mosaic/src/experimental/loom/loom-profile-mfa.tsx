import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { mfaSectionNode } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section';
import { UserProfileMfaSectionView } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.view';
import { useMessages } from '../../localization';
import { type LoomMfaState, useLoomProfileMfaModel } from './loom-profile-mfa.model';

export function LoomProfileMfa() {
  const state = useLoomProfileMfaModel();
  if (!state) {
    return null;
  }
  if (state.kind === 'snapshot') {
    return <SnapshotMfa state={state} />;
  }
  return mfaSectionNode(state.model);
}

function SnapshotMfa({ state }: { state: Extract<LoomMfaState, { kind: 'snapshot' }> }) {
  const m = useMessages('userProfileMfa');
  return (
    <UserProfileMfaSectionView
      methods={[...state.methods]}
      addableMethods={state.addableMethods}
      actionsEligible
      addControl={
        state.addableMethods.length > 0 ? (
          <Button
            aria-label={m.addLabel}
            color='neutral'
            size='sm'
            variant='outline'
            disabled
          >
            <Icon
              name='plus'
              placement='inline-start'
              size='sm'
            />
            {m.add}
          </Button>
        ) : undefined
      }
    />
  );
}
