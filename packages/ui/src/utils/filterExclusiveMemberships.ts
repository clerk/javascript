import type { OrganizationMembershipResource } from '@clerk/shared/types';

type FilterExclusiveMembershipsResult<T extends Pick<OrganizationMembershipResource, 'exclusiveMembership'>> = {
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
 * When the user belongs to at least one organization that enforces exclusive membership
 * (`exclusiveMembership === true`), only those exclusive memberships are returned and `hasExclusive`
 * is `true` (the caller should also hide the personal account and any non-exclusive organizations).
 * Otherwise the list is returned unchanged and `hasExclusive` is `false`.
 *
 * Note: memberships are paginated, so this operates on the currently loaded memberships. Exclusive
 * members are locked to ~1 organization, so pagination is a non-issue for them.
 */
export const filterExclusiveMemberships = <T extends Pick<OrganizationMembershipResource, 'exclusiveMembership'>>(
  memberships: T[],
): FilterExclusiveMembershipsResult<T> => {
  const hasExclusive = memberships.some(membership => membership.exclusiveMembership);

  if (!hasExclusive) {
    return { memberships, hasExclusive: false };
  }

  return {
    memberships: memberships.filter(membership => membership.exclusiveMembership),
    hasExclusive: true,
  };
};
