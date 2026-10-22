import { UserProfilePhoneSectionContent } from '../../features/user-profile/user-profile-phone-section/user-profile-phone-section';
import { useLoomProfilePhonesModel } from './loom-profile-phones.model';

export function LoomProfilePhones() {
  const state = useLoomProfilePhonesModel();
  return state ? <UserProfilePhoneSectionContent state={state} /> : null;
}
