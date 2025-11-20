import { useEffect, useRef } from 'react';

import { useClerk } from './react';
import type { OrganizationMembershipResource } from './types';

/**
 * Finds the organization membership for a given organization ID from a list of memberships
 *
 * @param organizationMemberships - Array of organization memberships to search through
 * @param organizationId - ID of the organization to find the membership for
 * @returns The matching organization membership or undefined if not found
 */
export function getCurrentOrganizationMembership(
  organizationMemberships: OrganizationMembershipResource[],
  organizationId: string,
) {
  return organizationMemberships.find(
    organizationMembership => organizationMembership.organization.id === organizationId,
  );
}

/**
 * Attempts to enable the organizations environment setting for a given caller
 *
 * @internal
 */
export function useAttemptToEnableOrganizations(caller: 'useOrganization' | 'useOrganizationList') {
  const clerk = useClerk();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Guard to not run this effect twice on Clerk resource update
    if (hasAttempted.current || !clerk.loaded) {
      return;
    }

    hasAttempted.current = true;
    clerk.__internal_attemptToEnableEnvironmentSetting?.({
      for: 'organizations',
      caller,
    });
  }, [clerk, caller]);
}
