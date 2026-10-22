import { UserProfileEmailSectionContent } from '../../features/user-profile/user-profile-email-section/user-profile-email-section';
import { useLoomProfileEmailsModel } from './loom-profile-emails.model';

export function LoomProfileEmails() {
  const state = useLoomProfileEmailsModel();
  return state ? <UserProfileEmailSectionContent state={state} /> : null;
}
