import type {
  ClerkPaginationParams,
  GetDomainsParams,
  GetInvitationsParams,
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
import type { GetMembersParams } from '@clerk/types';

import { deprecated } from '../../deprecated';
import { useSWR } from '../clerk-swr';
import { useClerkInstanceContext, useOrganizationContext, useSessionContext } from '../contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from '../types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

type UseOrganizationParams = {
  /**
   * @deprecated Use `invitations` instead
   */
  invitationList?: GetPendingInvitationsParams;
  /**
   * @deprecated Use `memberships` instead
   */
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
  memberships?:
    | true
    | (GetMembersParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });

  invitations?:
    | true
    | (GetInvitationsParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
};

type UseOrganization = <T extends UseOrganizationParams>(
  params?: T,
) =>
  | {
      isLoaded: false;
      organization: undefined;
      /**
       * @deprecated Use `invitations` instead
       */
      invitationList: undefined;
      /**
       * @deprecated Use `memberships` instead
       */
      membershipList: undefined;
      membership: undefined;
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
      membershipRequests: PaginatedResourcesWithDefault<OrganizationMembershipRequestResource>;
      memberships: PaginatedResourcesWithDefault<OrganizationMembershipResource>;
      invitations: PaginatedResourcesWithDefault<OrganizationInvitationResource>;
    }
  | {
      isLoaded: true;
      organization: OrganizationResource;
      /**
       * @deprecated Use `invitations` instead
       */
      invitationList: undefined;
      /**
       * @deprecated Use `memberships` instead
       */
      membershipList: undefined;
      membership: undefined;
      domains: PaginatedResourcesWithDefault<OrganizationDomainResource>;
      membershipRequests: PaginatedResourcesWithDefault<OrganizationMembershipRequestResource>;
      memberships: PaginatedResourcesWithDefault<OrganizationMembershipResource>;
      invitations: PaginatedResourcesWithDefault<OrganizationInvitationResource>;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      /**
       * @deprecated Use `invitations` instead
       */
      invitationList: OrganizationInvitationResource[] | null | undefined;
      /**
       * @deprecated Use `memberships` instead
       */
      membershipList: OrganizationMembershipResource[] | null | undefined;
      membership: OrganizationMembershipResource | null | undefined;
      domains: PaginatedResources<
        OrganizationDomainResource,
        T['membershipRequests'] extends { infinite: true } ? true : false,
        T['membershipRequests'] extends { infinite: true }
          ? ClerkPaginatedResponse<OrganizationDomainResource>
          : OrganizationDomainResource[]
      > | null;
      membershipRequests: PaginatedResources<
        OrganizationMembershipRequestResource,
        T['membershipRequests'] extends { infinite: true } ? true : false,
        T['membershipRequests'] extends { infinite: true }
          ? ClerkPaginatedResponse<OrganizationMembershipRequestResource>
          : OrganizationMembershipRequestResource[]
      > | null;
      memberships: PaginatedResources<
        OrganizationMembershipResource,
        T['memberships'] extends { infinite: true } ? true : false,
        T['memberships'] extends { infinite: true }
          ? ClerkPaginatedResponse<OrganizationMembershipResource>
          : OrganizationMembershipResource[]
      > | null;
      invitations: PaginatedResources<
        OrganizationInvitationResource,
        T['invitations'] extends { infinite: true } ? true : false,
        T['invitations'] extends { infinite: true }
          ? ClerkPaginatedResponse<OrganizationInvitationResource>
          : OrganizationInvitationResource[]
      > | null;
    };

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
  revalidate: undefined,
  setData: undefined,
} as const;

export const useOrganization: UseOrganization = params => {
  const {
    invitationList: invitationListParams,
    membershipList: membershipListParams,
    domains: domainListParams,
    membershipRequests: membershipRequestsListParams,
    memberships: membersListParams,
    invitations: invitationsListParams,
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

  const membersSafeValues = useWithSafeValues(membersListParams, {
    initialPage: 1,
    pageSize: 10,
    role: undefined,
    keepPreviousData: false,
    infinite: false,
  });

  const invitationsSafeValues = useWithSafeValues(invitationsListParams, {
    initialPage: 1,
    pageSize: 10,
    status: ['pending'],
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

  const membersParams =
    typeof membersListParams === 'undefined'
      ? undefined
      : {
          initialPage: membersSafeValues.initialPage,
          pageSize: membersSafeValues.pageSize,
          role: membersSafeValues.role,
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
    {
      ...membersParams,
      paginated: true,
    } as any,
    organization?.getMemberships as unknown as any,
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
      keepPreviousData: membersSafeValues.keepPreviousData,
      infinite: membersSafeValues.infinite,
      enabled: !!invitationsParams,
    },
    {
      type: 'invitations',
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

  if (invitationListParams) {
    deprecated('invitationList in useOrganization', 'Use the `invitations` property and return value instead.');
  }

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

  if (membershipListParams) {
    deprecated('membershipList in useOrganization', 'Use the `memberships` property and return value instead.');
  }

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
      memberships: undefinedPaginatedResource,
      invitations: undefinedPaginatedResource,
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
      memberships: null,
      invitations: null,
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
      memberships: undefinedPaginatedResource,
      invitations: undefinedPaginatedResource,
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
    // Let the hook return type define this type
    domains: domains as any,
    // Let the hook return type define this type
    membershipRequests: membershipRequests as any,
    // Let the hook return type define this type
    memberships: memberships as any,
    invitations: invitations as any,
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
