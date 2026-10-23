import { useProfileSnapshot } from '@clerk/loom/handoff';

import { projectProfileDetails } from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section.model';

export function useLoomProfileDetailsModel() {
  const { user, settings } = useProfileSnapshot();
  return projectProfileDetails(user, {
    first_name: settings.firstName,
    last_name: settings.lastName,
    username: {
      ...settings.username,
      used_for_first_factor: settings.username.usedForFirstFactor,
      used_for_second_factor: settings.username.usedForSecondFactor,
    },
  });
}
