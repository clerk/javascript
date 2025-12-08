import type { OrganizationMembershipResource } from './types';

/**
 * Finds the Organization membership for a given Organization ID from a list of memberships
 * @param organizationMemberships - Array of Organization memberships to search through
 * @param organizationId - ID of the Organization to find the membership for
 * @returns The matching Organization membership or undefined if not found
 */
export function getCurrentOrganizationMembership(
  organizationMemberships: OrganizationMembershipResource[],
  organizationId: string,
) {
  return organizationMemberships.find(
    organizationMembership => organizationMembership.organization.id === organizationId,
  );
}
