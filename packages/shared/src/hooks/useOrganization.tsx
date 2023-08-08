import type {
  ClerkPaginatedResponse,
  ClerkPaginationParams,
  GetDomainsParams,
  GetMembershipsParams,
  GetPendingInvitationsParams,
  OrganizationDomainResource,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';
import { useCallback, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { useClerkInstanceContext, useOrganizationContext, useSessionContext } from './contexts';
import type { PaginatedDataAPI, PaginatedDataAPIWithDefaults } from './useOrganizationList';

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
      domains: PaginatedDataAPIWithDefaults<OrganizationDomainResource>;
    }
  | {
      isLoaded: true;
      organization: OrganizationResource;
      invitationList: undefined;
      membershipList: undefined;
      membership: undefined;
      domains: PaginatedDataAPIWithDefaults<OrganizationDomainResource>;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      invitationList: OrganizationInvitationResource[] | null | undefined;
      membershipList: OrganizationMembershipResource[] | null | undefined;
      membership: OrganizationMembershipResource | null | undefined;
      domains: PaginatedDataAPI<OrganizationDomainResource> | null;
    };
type CustomSetAction<T = unknown> = (size: T | ((_size: T) => T)) => void;

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
  const [paginatedPage, setPaginatedPage] = useState(shouldUseDefaults ? 1 : domainListParams?.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(shouldUseDefaults ? 1 : domainListParams?.initialPage ?? 1);
  const initialPageSizeRef = useRef(shouldUseDefaults ? 10 : domainListParams?.initialPageSize ?? 10);

  const triggerInfinite = shouldUseDefaults ? false : !!domainListParams?.infinite;
  const internalKeepPreviousData = shouldUseDefaults ? false : !!domainListParams?.keepPreviousData;

  const clerk = useClerkInstanceContext();

  const shouldFetch = !!(clerk.loaded && session && organization);

  const paginatedParams =
    typeof domainListParams === 'undefined'
      ? undefined
      : {
          initialPage: paginatedPage,
          initialPageSize: initialPageSizeRef.current,
        };

  // Some gymnastics to adhere to the rules of hooks
  // We need to make sure useSWR is called on every render
  const fetchInvitations = !clerk.loaded
    ? () => ({ data: [], total_count: 0 } as ClerkPaginatedResponse<OrganizationDomainResource>)
    : () => organization?.getDomains(paginatedParams);

  const {
    data: userInvitationsData,
    isValidating: userInvitationsValidating,
    isLoading: userInvitationsLoading,
    error: userInvitationsError,
    mutate: userInvitationsMutate,
  } = useSWR(
    !triggerInfinite && shouldFetch && paginatedParams
      ? cacheKeyDomains('domains', organization, paginatedParams)
      : null,
    fetchInvitations,
    { keepPreviousData: internalKeepPreviousData },
  );

  const getInfiniteKey = (
    pageIndex: number,
    previousPageData: ClerkPaginatedResponse<OrganizationDomainResource> | null,
  ) => {
    if (!shouldFetch || !paginatedParams || !triggerInfinite) {
      return null;
    }

    return cacheKeyDomains('domains', organization, {
      initialPage: initialPageRef.current + pageIndex,
      initialPageSize: initialPageSizeRef.current,
    });
  };

  const {
    data: userInvitationsDataInfinite,
    isLoading: userInvitationsLoadingInfinite,
    isValidating: userInvitationsInfiniteValidating,
    error: userInvitationsInfiniteError,
    size,
    setSize,
    mutate: userInvitationsInfiniteMutate,
  } = useSWRInfinite(getInfiniteKey, ({ initialPage, initialPageSize }) => {
    return !clerk.loaded || !organization
      ? ({ data: [], total_count: 0 } as ClerkPaginatedResponse<OrganizationDomainResource>)
      : organization.getDomains({
          initialPage,
          initialPageSize,
        });
  });

  const isomorphicPage = useMemo(() => {
    if (triggerInfinite) {
      return size;
    }
    return paginatedPage;
  }, [triggerInfinite, size, paginatedPage]);

  const isomorphicSetPage: CustomSetAction<number> = useCallback(
    numberOrgFn => {
      if (triggerInfinite) {
        void setSize(numberOrgFn);
        return;
      }
      return setPaginatedPage(numberOrgFn);
    },
    [setSize],
  );

  const isomorphicData = useMemo(() => {
    if (triggerInfinite) {
      return userInvitationsDataInfinite?.map(a => a?.data).flat() ?? [];
    }
    return userInvitationsData?.data ?? [];
  }, [triggerInfinite, userInvitationsDataInfinite, userInvitationsData]);

  const isomorphicCount = useMemo(() => {
    if (triggerInfinite) {
      return userInvitationsDataInfinite?.[userInvitationsDataInfinite?.length - 1]?.total_count || 0;
    }
    return userInvitationsData?.total_count ?? 0;
  }, [triggerInfinite, userInvitationsDataInfinite, userInvitationsData]);

  const isomorphicIsLoading = triggerInfinite ? userInvitationsLoadingInfinite : userInvitationsLoading;
  const isomorphicIsFetching = triggerInfinite ? userInvitationsInfiniteValidating : userInvitationsValidating;
  const isomorphicIsError = !!(triggerInfinite ? userInvitationsInfiniteError : userInvitationsError);
  /**
   * Helpers
   */
  const fetchNext = useCallback(() => {
    isomorphicSetPage(n => n + 1);
  }, [isomorphicSetPage]);

  const fetchPrevious = useCallback(() => {
    isomorphicSetPage(n => n - 1);
  }, [isomorphicSetPage]);

  const offsetCount = (initialPageRef.current - 1) * initialPageSizeRef.current;

  const pageCount = Math.ceil((isomorphicCount - offsetCount) / initialPageSizeRef.current);
  const hasNextPage =
    isomorphicCount - offsetCount * initialPageSizeRef.current > isomorphicPage * initialPageSizeRef.current;
  const hasPreviousPage = (isomorphicPage - 1) * initialPageSizeRef.current > offsetCount * initialPageSizeRef.current;

  const unstable__mutate = triggerInfinite ? userInvitationsInfiniteMutate : userInvitationsMutate;

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

function cacheKeyDomains(type: 'domains', organization: OrganizationResource, pagination: GetDomainsParams) {
  return {
    type,
    organizationId: organization.id,
    initialPage: pagination.initialPage,
    initialPageSize: pagination.initialPageSize,
  };
}
