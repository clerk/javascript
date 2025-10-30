import type { OrganizationMembershipResource } from './types';

/**
 * Finds the organization membership for a given organization ID from a list of memberships
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
