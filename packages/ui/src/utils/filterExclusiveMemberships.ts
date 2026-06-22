import type { OrganizationMembershipResource } from '@clerk/shared/types';

type FilterExclusiveMembershipsResult<T extends Pick<OrganizationMembershipResource, 'organization'>> = {
  /**
   * When at least one exclusive membership is present, only the exclusive memberships are returned.
   * Otherwise the input list is returned unchanged.
   */
  memberships: T[];
  /**
   * `true` when the user has at least one exclusive membership. Callers should hide the personal
   * account/workspace and any non-exclusive organizations when this is `true`.
   */
  hasExclusive: boolean;
};

/**
 * Filters a list of organization memberships for exclusive membership.
 *
 * Exclusivity is a property of the Organization (`organization.exclusiveMembership`), so a membership
 * is considered exclusive when its Organization enforces exclusive membership. When the user belongs
 * to at least one such Organization, only those exclusive memberships are returned and `hasExclusive`
 * is `true` (the caller should also hide the personal account and any non-exclusive organizations).
 * Otherwise the list is returned unchanged and `hasExclusive` is `false`.
 *
 * Callers should derive `hasExclusive` from the full, non-paginated membership set
 * (e.g. `user.organizationMemberships`) so it never fails open when the exclusive membership is not on
 * the currently loaded page.
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
