import type { OrganizationMembershipResource } from '@clerk/shared/types';

type FilterExclusiveMembershipsResult<T extends Pick<OrganizationMembershipResource, 'organization'>> = {
  memberships: T[];
  hasExclusive: boolean;
};

/**
 * Filters a list of organization memberships for exclusive membership.
 */
export const filterExclusiveMemberships = <T extends Pick<OrganizationMembershipResource, 'organization'>>(
  memberships: T[],
): FilterExclusiveMembershipsResult<T> => {
  const hasExclusive = memberships.some(membership => membership.organization.exclusiveMembership);

  if (!hasExclusive) {
    return { memberships, hasExclusive: false };
  }

  return {
    memberships: memberships.filter(membership => membership.organization.exclusiveMembership),
    hasExclusive: true,
  };
};
