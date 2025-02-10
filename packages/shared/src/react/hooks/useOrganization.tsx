import type {
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

import { eventMethodCalled } from '../../telemetry/events/method-called';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useSessionContext,
} from '../contexts';
import type { PaginatedHookConfig, PaginatedResources, PaginatedResourcesWithDefault } from '../types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

type UseOrganizationParams = {
  /**
   * If set to `true`, all default properties will be used. Otherwise, accepts an object with an optional `enrollmentMode` property of type [`OrganizationEnrollmentMode`](https://clerk.com/docs/references/react/use-organization#organization-enrollment-mode) and any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization#shared-properties).
   */
  domains?: true | PaginatedHookConfig<GetDomainsParams>;
  /**
   * If set to `true`, all default properties will be used. Otherwise, accepts an object with an optional `status` property of type [`OrganizationInvitationStatus`](https://clerk.com/docs/references/react/use-organization#organization-invitation-status) and any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization#shared-properties).
   */
  membershipRequests?: true | PaginatedHookConfig<GetMembershipRequestParams>;
  /**
   * If set to `true`, all default properties will be used. Otherwise, accepts an object with an optional `role` property of type [`OrganizationCustomRoleKey[]`](https://clerk.com/docs/references/react/use-organization#organization-custome-role-key) and any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization#shared-properties).
   */
  memberships?: true | PaginatedHookConfig<GetMembersParams>;
  /**
   * If set to `true`, all default properties will be used. Otherwise, accepts an object with an optional `status` property of type [`OrganizationInvitationStatus`](https://clerk.com/docs/references/react/use-organization#organization-invitation-status) and any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization#shared-properties).
   */
  invitations?: true | PaginatedHookConfig<GetInvitationsParams>;
};

type UseOrganization = <T extends UseOrganizationParams>(
  params?: T,
) =>
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
    }
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * The currently active organization.
       */
      organization: OrganizationResource;
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
    }
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: boolean;
      /**
       * The currently active organization.
       */
      organization: OrganizationResource | null;
      /**
       * The current organization membership.
       */
      membership: OrganizationMembershipResource | null | undefined;
      /**
       * Includes a paginated list of the organization's domains.
       */
      domains: PaginatedResources<
        OrganizationDomainResource,
        T['membershipRequests'] extends { infinite: true } ? true : false
      > | null;
      /**
       * Includes a paginated list of the organization's membership requests.
       */
      membershipRequests: PaginatedResources<
        OrganizationMembershipRequestResource,
        T['membershipRequests'] extends { infinite: true } ? true : false
      > | null;
      /**
       * Includes a paginated list of the organization's memberships.
       */
      memberships: PaginatedResources<
        OrganizationMembershipResource,
        T['memberships'] extends { infinite: true } ? true : false
      > | null;
      /**
       * Includes a paginated list of the organization's invitations.
       */
      invitations: PaginatedResources<
        OrganizationInvitationResource,
        T['invitations'] extends { infinite: true } ? true : false
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
 */
export const useOrganization: UseOrganization = params => {
  const {
    domains: domainListParams,
    membershipRequests: membershipRequestsListParams,
    memberships: membersListParams,
    invitations: invitationsListParams,
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

  if (organization === undefined) {
    return {
      isLoaded: false,
      organization: undefined,
      membership: undefined,
      domains: undefinedPaginatedResource,
      membershipRequests: undefinedPaginatedResource,
      memberships: undefinedPaginatedResource,
      invitations: undefinedPaginatedResource,
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
    };
  }

  return {
    isLoaded: clerk.loaded,
    organization,
    membership: getCurrentOrganizationMembership(session!.user.organizationMemberships, organization.id), // your membership in the current org
    domains,
    membershipRequests,
    memberships,
    invitations,
  };
};

function getCurrentOrganizationMembership(
  organizationMemberships: OrganizationMembershipResource[],
  activeOrganizationId: string,
) {
  return organizationMemberships.find(
    organizationMembership => organizationMembership.organization.id === activeOrganizationId,
  );
}
