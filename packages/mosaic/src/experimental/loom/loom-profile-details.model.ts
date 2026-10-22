import { useLoom, useSuspenseProfile, useSuspenseUser } from '@clerk/loom/react';
import { useClerk, useSession, useUser } from '@clerk/shared/react';

import {
  NAME_FIELDS,
  projectProfileDetails,
  useUserProfileProfileActions,
} from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section.model';
import type { ProfileDetailsState } from '../../features/user-profile/user-profile-profile-section/user-profile-profile-section.types';
import { save } from '../../utils/errors';

export function useLoomProfileIdentity(): boolean {
  const loom = useLoom();
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  return (
    (!isLoaded || user?.id === loom.scope.userId) &&
    (!isSessionLoaded || session?.id === loom.scope.sessionId) &&
    (!clerk.loaded ||
      JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]) ===
        loom.scope.instanceKey)
  );
}

export function useLoomProfileActionsContext() {
  const loom = useLoom();
  return {
    scope: loom.scope,
    onMutation: () => {
      void loom.invalidateUser().catch(() => {});
    },
  };
}

export function useLoomProfileDetailsModel(): ProfileDetailsState {
  const profile = useSuspenseProfile();
  const { updateName } = useSuspenseUser();
  const actions = useUserProfileProfileActions(useLoomProfileActionsContext());
  const display = projectProfileDetails(profile.user, {
    first_name: profile.settings.firstName,
    last_name: profile.settings.lastName,
    username: {
      ...profile.settings.username,
      used_for_first_factor: profile.settings.username.usedForFirstFactor,
      used_for_second_factor: profile.settings.username.usedForSecondFactor,
    },
  });
  return {
    kind: 'interactive',
    model: {
      ...display,
      ...(actions.status === 'ready' ? actions : {}),
      status: 'ready',
      onSubmitName:
        display.nameManagedBy || !updateName ? undefined : value => save(() => updateName(value), NAME_FIELDS),
      onSubmitUsername:
        display.showUsername && !profile.settings.username.immutable && actions.status === 'ready'
          ? actions.onSubmitUsername
          : undefined,
      onRemoveProfilePicture:
        profile.user.hasImage && actions.status === 'ready' ? actions.onRemoveProfilePicture : undefined,
    },
  };
}
