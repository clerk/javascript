import {
  disabledUserAPIKeysFeature,
  disabledUserBillingFeature,
} from '@clerk/shared/internal/clerk-js/componentGuards';
import { useClerk } from '@clerk/shared/react';

import { useMosaicEnvironment } from './useMosaicEnvironment';

/** A page the UserProfile brings itself, named by the id its navigation knows it as. */
export type UserProfilePageId = 'account' | 'security' | 'billing' | 'apiKeys';

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

  const pages: UserProfilePageId[] = ['account', 'security'];
  if (!disabledUserBillingFeature(clerk, environment)) {
    pages.push('billing');
  }
  if (!disabledUserAPIKeysFeature(clerk, environment)) {
    pages.push('apiKeys');
  }
  return pages;
}
