import type {
  ClerkPaginationParams,
  GetDomainsParams,
  GetMembershipsParams,
  GetPendingInvitationsParams,
  OrganizationDomainResource,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';
import type { ClerkPaginatedResponse } from '@clerk/types';
import { useRef } from 'react';
import useSWR from 'swr';

import { useClerkInstanceContext, useOrganizationContext, useSessionContext } from './contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from './types';
import { usePagesOrInfinite } from './usePagesOrInfinite';

type UseOrganizationParams = {
  invitationList?: GetPendingInvitationsParams;
  membershipList?: GetMembershipsParams;
  domains?:
    | true
    | (GetDomainsParams & {
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
    }
  | {
      isLoaded: true;
      organization: OrganizationResource;
      invitationList: undefined;
      membershipList: undefined;
      membership: undefined;
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      invitationList: OrganizationInvitationResource[] | null | undefined;
      membershipList: OrganizationMembershipResource[] | null | undefined;
      membership: OrganizationMembershipResource | null | undefined;
      domains: PaginatedResources<OrganizationDomainResource> | null;
    };

type UseOrganization = (params?: UseOrganizationParams) => UseOrganizationReturn;

export const useOrganization: UseOrganization = params => {
  const {
    invitationList: invitationListParams,
    membershipList: membershipListParams,
    domains: domainListParams,
  } = params || {};
  const { organization, lastOrganizationMember, lastOrganizationInvitation } = useOrganizationContext();
  const session = useSessionContext();

  const shouldUseDefaults = typeof domainListParams === 'boolean' && domainListParams;

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(shouldUseDefaults ? 1 : domainListParams?.initialPage ?? 1);
  const pageSizeRef = useRef(shouldUseDefaults ? 10 : domainListParams?.pageSize ?? 10);

  const triggerInfinite = shouldUseDefaults ? false : !!domainListParams?.infinite;
  const internalKeepPreviousData = shouldUseDefaults ? false : !!domainListParams?.keepPreviousData;

  const clerk = useClerkInstanceContext();

  const shouldFetch = !!(clerk.loaded && session && organization);

  const paginatedParams =
    typeof domainListParams === 'undefined'
      ? undefined
      : {
          initialPage: initialPageRef.current,
          pageSize: pageSizeRef.current,
        };

  const {
    data: isomorphicData,
    count: isomorphicCount,
    isLoading: isomorphicIsLoading,
    isFetching: isomorphicIsFetching,
    isError: isomorphicIsError,
    page: isomorphicPage,
    pageCount,
    fetchPage: isomorphicSetPage,
    fetchNext,
    fetchPrevious,
    hasNextPage,
    hasPreviousPage,
    unstable__mutate,
  } = usePagesOrInfinite<GetDomainsParams, ClerkPaginatedResponse<OrganizationDomainResource>>(
    {
      ...paginatedParams,
    },
    organization?.getDomains,
    {
      keepPreviousData: internalKeepPreviousData,
      infinite: triggerInfinite,
      enabled: !!paginatedParams,
    },
    {
      type: 'domains',
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
      domains: {
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
      },
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
      domains: {
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
      },
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
    domains: {
      data: isomorphicData,
      count: isomorphicCount,
      isLoading: isomorphicIsLoading,
      isFetching: isomorphicIsFetching,
      isError: isomorphicIsError,
      page: isomorphicPage,
      pageCount,
      fetchPage: isomorphicSetPage,
      fetchNext,
      fetchPrevious,
      hasNextPage,
      hasPreviousPage,
      unstable__mutate,
    },
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
