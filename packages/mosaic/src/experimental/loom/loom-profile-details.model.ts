import { useSuspenseProfile } from '@clerk/loom/react';

import {
  NAME_FIELDS,
  projectProfileDetails,
} from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section.model';
import type { ProfileDetailsState } from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section.types';
import { save } from '../../utils/errors';

export function useLoomProfileDetailsModel(): ProfileDetailsState {
  const { user, settings, actions } = useSuspenseProfile();
  const display = projectProfileDetails(user, {
    first_name: settings.firstName,
    last_name: settings.lastName,
    username: {
      ...settings.username,
      used_for_first_factor: settings.username.usedForFirstFactor,
      used_for_second_factor: settings.username.usedForSecondFactor,
    },
  });
  const updateName = actions.details.updateName;
  const updateUsername = actions.details.updateUsername;
  const usernameLength = actions.details.usernameLength;
  const setProfileImage = actions.details.setProfileImage;
  const removeProfileImage = actions.details.removeProfileImage;
  return {
    kind: 'interactive',
    model: {
      ...display,
      status: 'ready',
      onSubmitName:
        display.nameManagedBy || !updateName ? undefined : value => save(() => updateName(value), NAME_FIELDS),
      onSubmitUsername:
        display.showUsername && !settings.username.immutable && updateUsername
          ? username =>
              save(
                () => updateUsername(username),
                ['username'],
                usernameLength ? { min_length: usernameLength.min, max_length: usernameLength.max } : undefined,
              )
          : undefined,
      onProfilePictureChange: setProfileImage ? file => save(() => setProfileImage(file)) : undefined,
      onRemoveProfilePicture: user.hasImage && removeProfileImage ? () => save(() => removeProfileImage()) : undefined,
    },
  };
}
