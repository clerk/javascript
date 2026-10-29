import {
  disabledUserAPIKeysFeature,
  disabledUserBillingFeature,
} from '@clerk/shared/internal/clerk-js/componentGuards';
import { useClerk } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { USER_PROFILE_PAGE_IDS } from '../user-profile/user-profile.layout';
import type { UserProfilePageId } from '../user-profile/user-profile.types';

/**
 * The UserProfile's own pages, in the order it lists them, minus the ones this instance has turned
 * off.
 *
 * Ordering a custom page after a built-in one means naming every built-in that follows it, so the
 * list has to match what the profile will actually show. It mirrors clerk-js rather than being read
 * from it: the profile is not mounted yet at the point this is needed, and it decides its own pages
 * from the same environment behind the same guards.
 */
export function useUserProfilePages(): UserProfilePageId[] {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  const disabled: Partial<Record<UserProfilePageId, boolean>> = {
    billing: disabledUserBillingFeature(clerk, environment),
    apiKeys: disabledUserAPIKeysFeature(clerk, environment),
  };
  return USER_PROFILE_PAGE_IDS.filter(id => !disabled[id]);
}
