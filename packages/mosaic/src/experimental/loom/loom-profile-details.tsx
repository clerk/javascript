import { UserProfileProfileSectionContent } from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section';
import { useLoomProfileDetailsModel, useLoomProfileIdentity } from './loom-profile-details.model';

export function LoomProfileDetails() {
  const identity = useLoomProfileIdentity();
  if (!identity) {
    return null;
  }
  return <ConnectedProfileDetails />;
}

function ConnectedProfileDetails() {
  const state = useLoomProfileDetailsModel();
  if (!state) {
    return null;
  }
  return (
    <>
      {state.kind === 'snapshot' ? <p role='status'>Profile details loaded; account settings connecting.</p> : null}
      <UserProfileProfileSectionContent state={state} />
    </>
  );
}
