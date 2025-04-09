import type {
  __experimental_CommerceSubscriptionResource,
  __experimental_GetSubscriptionsParams,
  ClerkPaginatedResponse,
  GetDomainsParams,
  GetInvitationsParams,
  GetMembershipRequestParams,
  GetMembersParams,
  OrganizationDomainResource,
  OrganizationInvitationResource,
  OrganizationMembershipRequestResource,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';

import { getCurrentOrganizationMembership } from '../../organization';
import { eventMethodCalled } from '../../telemetry/events/method-called';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useSessionContext,
} from '../contexts';
import type { PaginatedHookConfig, PaginatedResources, PaginatedResourcesWithDefault } from '../types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

/**
 * @interface
 */
export type UseOrganizationParams = {
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   * <ul>
   *  <li>`enrollmentMode`: A string that filters the domains by the provided enrollment mode.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  domains?: true | PaginatedHookConfig<GetDomainsParams>;
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   * <ul>
   *  <li>`status`: A string that filters the membership requests by the provided status.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  membershipRequests?: true | PaginatedHookConfig<GetMembershipRequestParams>;
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   * <ul>
   *  <li>`role`: An array of [`OrganizationCustomRoleKey`](https://clerk.com/docs/references/javascript/types/organization-custom-role-key).</li>
   *  <li>`query`: A string that filters the memberships by the provided string.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  memberships?: true | PaginatedHookConfig<GetMembersParams>;
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   * <ul>
   *  <li>`status`: A string that filters the invitations by the provided status.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  invitations?: true | PaginatedHookConfig<GetInvitationsParams>;
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   * <ul>
   *  <li>`status`: A string that filters the subscriptions by the provided status.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  subscriptions?: true | PaginatedHookConfig<__experimental_GetSubscriptionsParams>;
};

/**
 * @interface
 */
export type UseOrganizationReturn<T extends UseOrganizationParams> =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * The currently active organization.
       */
      organization: undefined;
      /**
       * The current organization membership.
       */
      membership: undefined;
      /**
       * Includes a paginated list of the organization's domains.
       */
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
      /**
       * Includes a paginated list of the organization's membership requests.
       */
      membershipRequests: PaginatedResourcesWithDefault<OrganizationMembershipRequestResource>;
      /**
       * Includes a paginated list of the organization's memberships.
       */
      memberships: PaginatedResourcesWithDefault<OrganizationMembershipResource>;
      /**
       * Includes a paginated list of the organization's invitations.
       */
      invitations: PaginatedResourcesWithDefault<OrganizationInvitationResource>;
      /**
       * Includes a paginated list of the organization's subscriptions.
       */
      subscriptions: PaginatedResourcesWithDefault<__experimental_CommerceSubscriptionResource>;
    }
  | {
      isLoaded: true;
      organization: OrganizationResource;
      membership: undefined;
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
      membershipRequests: PaginatedResourcesWithDefault<OrganizationMembershipRequestResource>;
      memberships: PaginatedResourcesWithDefault<OrganizationMembershipResource>;
      invitations: PaginatedResourcesWithDefault<OrganizationInvitationResource>;
      subscriptions: PaginatedResourcesWithDefault<__experimental_CommerceSubscriptionResource>;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      membership: OrganizationMembershipResource | null | undefined;
      domains: PaginatedResources<
        OrganizationDomainResource,
        T['membershipRequests'] extends { infinite: true } ? true : false
      > | null;
      membershipRequests: PaginatedResources<
        OrganizationMembershipRequestResource,
        T['membershipRequests'] extends { infinite: true } ? true : false
      > | null;
      memberships: PaginatedResources<
        OrganizationMembershipResource,
        T['memberships'] extends { infinite: true } ? true : false
      > | null;
      invitations: PaginatedResources<
        OrganizationInvitationResource,
        T['invitations'] extends { infinite: true } ? true : false
      > | null;
      subscriptions: PaginatedResources<
        __experimental_CommerceSubscriptionResource,
        T['subscriptions'] extends { infinite: true } ? true : false
      > | null;
    };

const undefinedPaginatedResource = {
  data: undefined,
  count: undefined,
  error: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  page: undefined,
  pageCount: undefined,
  fetchPage: undefined,
  fetchNext: undefined,
  fetchPrevious: undefined,
  hasNextPage: false,
  hasPreviousPage: false,
  revalidate: undefined,
  setData: undefined,
} as const;

/**
 * The `useOrganization()` hook retrieves attributes of the currently active organization.
 *
 * @example
 * ### Expand and paginate attributes
 *
 * To keep network usage to a minimum, developers are required to opt-in by specifying which resource they need to fetch and paginate through. By default, the `memberships`, `invitations`, `membershipRequests`, and `domains` attributes are not populated. You must pass `true` or an object with the desired properties to fetch and paginate the data.
 *
 * ```tsx
 * // invitations.data will never be populated.
 * const { invitations } = useOrganization()
 *
 * // Use default values to fetch invitations, such as initialPage = 1 and pageSize = 10
 * const { invitations } = useOrganization({
 *   invitations: true,
 * })
 *
 * // Pass your own values to fetch invitations
 * const { invitations } = useOrganization({
 *   invitations: {
 *     pageSize: 20,
 *     initialPage: 2, // skips the first page
 *   },
 * })
 *
 * // Aggregate pages in order to render an infinite list
 * const { invitations } = useOrganization({
 *   invitations: {
 *     infinite: true,
 *   },
 * })
 * ```
 *
 * @example
 * ### Infinite pagination
 *
 * The following example demonstrates how to use the `infinite` property to fetch and append new data to the existing list. The `memberships` attribute will be populated with the first page of the organization's memberships. When the "Load more" button is clicked, the `fetchNext` helper function will be called to append the next page of memberships to the list.
 *
 * ```tsx
 * import { useOrganization } from '@clerk/clerk-react'
 *
 * export default function MemberList() {
 *   const { memberships } = useOrganization({
 *     memberships: {
 *       infinite: true, // Append new data to the existing list
 *       keepPreviousData: true, // Persist the cached data until the new data has been fetched
 *     },
 *   })
 *
 *   if (!memberships) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   return (
 *     <div>
 *       <h2>Organization members</h2>
 *       <ul>
 *         {memberships.data?.map((membership) => (
 *           <li key={membership.id}>
 *             {membership.publicUserData.firstName} {membership.publicUserData.lastName} <
 *             {membership.publicUserData.identifier}> :: {membership.role}
 *           </li>
 *         ))}
 *       </ul>
 *
 *       <button
 *         disabled={!memberships.hasNextPage} // Disable the button if there are no more available pages to be fetched
 *         onClick={memberships.fetchNext}
 *       >
 *         Load more
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ### Simple pagination
 *
 * The following example demonstrates how to use the `fetchPrevious` and `fetchNext` helper functions to paginate through the data. The `memberships` attribute will be populated with the first page of the organization's memberships. When the "Previous page" or "Next page" button is clicked, the `fetchPrevious` or `fetchNext` helper function will be called to fetch the previous or next page of memberships.
 *
 * Notice the difference between this example's pagination and the infinite pagination example above.
 *
 * ```tsx
 * import { useOrganization } from '@clerk/clerk-react'
 *
 * export default function MemberList() {
 *   const { memberships } = useOrganization({
 *     memberships: {
 *       keepPreviousData: true, // Persist the cached data until the new data has been fetched
 *     },
 *   })
 *
 *   if (!memberships) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   return (
 *     <div>
 *       <h2>Organization members</h2>
 *       <ul>
 *         {memberships.data?.map((membership) => (
 *           <li key={membership.id}>
 *             {membership.publicUserData.firstName} {membership.publicUserData.lastName} <
 *             {membership.publicUserData.identifier}> :: {membership.role}
 *           </li>
 *         ))}
 *       </ul>
 *
 *       <button disabled={!memberships.hasPreviousPage} onClick={memberships.fetchPrevious}>
 *         Previous page
 *       </button>
 *
 *       <button disabled={!memberships.hasNextPage} onClick={memberships.fetchNext}>
 *         Next page
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useOrganization<T extends UseOrganizationParams>(params?: T): UseOrganizationReturn<T> {
  const {
    domains: domainListParams,
    membershipRequests: membershipRequestsListParams,
    memberships: membersListParams,
    invitations: invitationsListParams,
    subscriptions: subscriptionsListParams,
  } = params || {};

  useAssertWrappedByClerkProvider('useOrganization');

  const { organization } = useOrganizationContext();
  const session = useSessionContext();

  const domainSafeValues = useWithSafeValues(domainListParams, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
    enrollmentMode: undefined,
  });

  const membershipRequestSafeValues = useWithSafeValues(membershipRequestsListParams, {
    initialPage: 1,
    pageSize: 10,
    status: 'pending',
    keepPreviousData: false,
    infinite: false,
  });

  const membersSafeValues = useWithSafeValues(membersListParams, {
    initialPage: 1,
    pageSize: 10,
    role: undefined,
    keepPreviousData: false,
    infinite: false,
    query: undefined,
  });

  const invitationsSafeValues = useWithSafeValues(invitationsListParams, {
    initialPage: 1,
    pageSize: 10,
    status: ['pending'],
    keepPreviousData: false,
    infinite: false,
  });

  const subscriptionsSafeValues = useWithSafeValues(subscriptionsListParams, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
  });

  const clerk = useClerkInstanceContext();

  clerk.telemetry?.record(eventMethodCalled('useOrganization'));

  const domainParams =
    typeof domainListParams === 'undefined'
      ? undefined
      : {
          initialPage: domainSafeValues.initialPage,
          pageSize: domainSafeValues.pageSize,
          enrollmentMode: domainSafeValues.enrollmentMode,
        };

  const membershipRequestParams =
    typeof membershipRequestsListParams === 'undefined'
      ? undefined
      : {
          initialPage: membershipRequestSafeValues.initialPage,
          pageSize: membershipRequestSafeValues.pageSize,
          status: membershipRequestSafeValues.status,
        };

  const membersParams =
    typeof membersListParams === 'undefined'
      ? undefined
      : {
          initialPage: membersSafeValues.initialPage,
          pageSize: membersSafeValues.pageSize,
          role: membersSafeValues.role,
          query: membersSafeValues.query,
        };

  const invitationsParams =
    typeof invitationsListParams === 'undefined'
      ? undefined
      : {
          initialPage: invitationsSafeValues.initialPage,
          pageSize: invitationsSafeValues.pageSize,
          status: invitationsSafeValues.status,
        };

  const subscriptionsParams =
    typeof subscriptionsListParams === 'undefined'
      ? undefined
      : {
          initialPage: subscriptionsSafeValues.initialPage,
          pageSize: subscriptionsSafeValues.pageSize,
          orgId: organization?.id,
        };

  const domains = usePagesOrInfinite<GetDomainsParams, ClerkPaginatedResponse<OrganizationDomainResource>>(
    {
      ...domainParams,
    },
    organization?.getDomains,
    {
      keepPreviousData: domainSafeValues.keepPreviousData,
      infinite: domainSafeValues.infinite,
      enabled: !!domainParams,
    },
    {
      type: 'domains',
      organizationId: organization?.id,
    },
  );

  const membershipRequests = usePagesOrInfinite<
    GetMembershipRequestParams,
    ClerkPaginatedResponse<OrganizationMembershipRequestResource>
  >(
    {
      ...membershipRequestParams,
    },
    organization?.getMembershipRequests,
    {
      keepPreviousData: membershipRequestSafeValues.keepPreviousData,
      infinite: membershipRequestSafeValues.infinite,
      enabled: !!membershipRequestParams,
    },
    {
      type: 'membershipRequests',
      organizationId: organization?.id,
    },
  );

  const memberships = usePagesOrInfinite<GetMembersParams, ClerkPaginatedResponse<OrganizationMembershipResource>>(
    membersParams || {},
    organization?.getMemberships,
    {
      keepPreviousData: membersSafeValues.keepPreviousData,
      infinite: membersSafeValues.infinite,
      enabled: !!membersParams,
    },
    {
      type: 'members',
      organizationId: organization?.id,
    },
  );

  const invitations = usePagesOrInfinite<GetInvitationsParams, ClerkPaginatedResponse<OrganizationInvitationResource>>(
    {
      ...invitationsParams,
    },
    organization?.getInvitations,
    {
      keepPreviousData: invitationsSafeValues.keepPreviousData,
      infinite: invitationsSafeValues.infinite,
      enabled: !!invitationsParams,
    },
    {
      type: 'invitations',
      organizationId: organization?.id,
    },
  );

  const subscriptions = usePagesOrInfinite<
    __experimental_GetSubscriptionsParams,
    ClerkPaginatedResponse<__experimental_CommerceSubscriptionResource>
  >(
    {
      ...subscriptionsParams,
    },
    organization?.__experimental_getSubscriptions,
    {
      keepPreviousData: subscriptionsSafeValues.keepPreviousData,
      infinite: subscriptionsSafeValues.infinite,
      enabled: !!subscriptionsParams,
    },
    {
      type: 'subscriptions',
      organizationId: organization?.id,
    },
  );

  if (organization === undefined) {
    return {
      isLoaded: false,
      organization: undefined,
      membership: undefined,
      domains: undefinedPaginatedResource,
      membershipRequests: undefinedPaginatedResource,
      memberships: undefinedPaginatedResource,
      invitations: undefinedPaginatedResource,
      subscriptions: undefinedPaginatedResource,
    };
  }

  if (organization === null) {
    return {
      isLoaded: true,
      organization: null,
      membership: null,
      domains: null,
      membershipRequests: null,
      memberships: null,
      invitations: null,
      subscriptions: null,
    };
  }

  /** In SSR context we include only the organization object when loadOrg is set to true. */
  if (!clerk.loaded && organization) {
    return {
      isLoaded: true,
      organization,
      membership: undefined,
      domains: undefinedPaginatedResource,
      membershipRequests: undefinedPaginatedResource,
      memberships: undefinedPaginatedResource,
      invitations: undefinedPaginatedResource,
      subscriptions: undefinedPaginatedResource,
    };
  }

  return {
    isLoaded: clerk.loaded,
    organization,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    membership: getCurrentOrganizationMembership(session!.user.organizationMemberships, organization.id), // your membership in the current org
    domains,
    membershipRequests,
    memberships,
    invitations,
    subscriptions,
  };
}
