import type {
  ClerkPaginationParams,
  GetDomainsParams,
  GetMembershipRequestParams,
  GetMembershipsParams,
  GetPendingInvitationsParams,
  OrganizationDomainResource,
  OrganizationInvitationResource,
  OrganizationMembershipRequestResource,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';
import type { ClerkPaginatedResponse } from '@clerk/types';

import { disableSWRDevtools } from './clerk-swr';
disableSWRDevtools();
import { useSWR } from './clerk-swr';
import { useClerkInstanceContext, useOrganizationContext, useSessionContext } from './contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from './types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

type UseOrganizationParams = {
  invitationList?: GetPendingInvitationsParams;
  membershipList?: GetMembershipsParams;
  domains?:
    | true
    | (GetDomainsParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
  membershipRequests?:
    | true
    | (GetMembershipRequestParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
};

type UseOrganizationReturn =
  | {
      isLoaded: false;
      organization: undefined;
      invitationList: undefined;
      membershipList: undefined;
      membership: undefined;
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
      membershipRequests: PaginatedResourcesWithDefault<OrganizationMembershipRequestResource>;
    }
  | {
      isLoaded: true;
      organization: OrganizationResource;
      invitationList: undefined;
      membershipList: undefined;
      membership: undefined;
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
      membershipRequests: PaginatedResourcesWithDefault<OrganizationMembershipRequestResource>;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      invitationList: OrganizationInvitationResource[] | null | undefined;
      membershipList: OrganizationMembershipResource[] | null | undefined;
      membership: OrganizationMembershipResource | null | undefined;
      domains: PaginatedResources<OrganizationDomainResource> | null;
      membershipRequests: PaginatedResources<OrganizationMembershipRequestResource> | null;
    };

type UseOrganization = (params?: UseOrganizationParams) => UseOrganizationReturn;

const undefinedPaginatedResource = {
  data: undefined,
  count: undefined,
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
} as const;

export const useOrganization: UseOrganization = params => {
  const {
    invitationList: invitationListParams,
    membershipList: membershipListParams,
    domains: domainListParams,
    membershipRequests: membershipRequestsListParams,
  } = params || {};
  const { organization, lastOrganizationMember, lastOrganizationInvitation } = useOrganizationContext();
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

  const clerk = useClerkInstanceContext();

  const shouldFetch = !!(clerk.loaded && session && organization);

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

  // Some gymnastics to adhere to the rules of hooks
  // We need to make sure useSWR is called on every render
  const pendingInvitations = !clerk.loaded
    ? () => [] as OrganizationInvitationResource[]
    : () => clerk.organization?.getPendingInvitations(invitationListParams);

  const currentOrganizationMemberships = !clerk.loaded
    ? () => [] as OrganizationMembershipResource[]
    : () => clerk.organization?.getMemberships(membershipListParams);

  const {
    data: invitationList,
    isValidating: isInvitationsLoading,
    mutate: mutateInvitationList,
  } = useSWR(
    shouldFetch && invitationListParams
      ? cacheKey('invites', organization, lastOrganizationInvitation, invitationListParams)
      : null,
    pendingInvitations,
  );

  const {
    data: membershipList,
    isValidating: isMembershipsLoading,
    mutate: mutateMembershipList,
  } = useSWR(
    shouldFetch && membershipListParams
      ? cacheKey('memberships', organization, lastOrganizationMember, membershipListParams)
      : null,
    currentOrganizationMemberships,
  );

  if (organization === undefined) {
    return {
      isLoaded: false,
      organization: undefined,
      invitationList: undefined,
      membershipList: undefined,
      membership: undefined,
      domains: undefinedPaginatedResource,
      membershipRequests: undefinedPaginatedResource,
    };
  }

  if (organization === null) {
    return {
      isLoaded: true,
      organization: null,
      invitationList: null,
      membershipList: null,
      membership: null,
      domains: null,
      membershipRequests: null,
    };
  }

  /** In SSR context we include only the organization object when loadOrg is set to true. */
  if (!clerk.loaded && organization) {
    return {
      isLoaded: true,
      organization,
      invitationList: undefined,
      membershipList: undefined,
      membership: undefined,
      domains: undefinedPaginatedResource,
      membershipRequests: undefinedPaginatedResource,
    };
  }

  return {
    isLoaded: !isMembershipsLoading && !isInvitationsLoading,
    organization,
    membershipList,
    membership: getCurrentOrganizationMembership(session!.user.organizationMemberships, organization.id), // your membership in the current org
    invitationList,
    unstable__mutate: () => {
      void mutateMembershipList();
      void mutateInvitationList();
    },
    domains,
    membershipRequests,
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

function cacheKey(
  type: 'memberships' | 'invites',
  organization: OrganizationResource,
  resource: OrganizationInvitationResource | OrganizationMembershipResource | null | undefined,
  pagination: ClerkPaginationParams,
) {
  return [type, organization.id, resource?.id, resource?.updatedAt, pagination.offset, pagination.limit]
    .filter(Boolean)
    .join('-');
}
