import { UserProfileEmailSectionContent } from '../../features/user-profile/user-profile-email-section/user-profile-email-section';
import { useLoomProfileIdentity } from './loom-profile-details.model';
import { useLoomProfileEmailsModel } from './loom-profile-emails.model';

export function LoomProfileEmails() {
  const identity = useLoomProfileIdentity();
  if (!identity) {
    return null;
  }
  return <ConnectedProfileEmails />;
}

function ConnectedProfileEmails() {
  const state = useLoomProfileEmailsModel();
  return state ? <UserProfileEmailSectionContent state={state} /> : null;
}
