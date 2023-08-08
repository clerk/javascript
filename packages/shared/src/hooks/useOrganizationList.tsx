import type {
  ClerkPaginatedResponse,
  CreateOrganizationParams,
  GetUserOrganizationInvitationsParams,
  OrganizationMembershipResource,
  OrganizationResource,
  SetActive,
  UserOrganizationInvitationResource,
  UserResource,
} from '@clerk/types';
import { useCallback, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { useClerkInstanceContext, useUserContext } from './contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault, ValueOrSetter } from './types';

type UseOrganizationListParams = {
  userInvitations?:
    | true
    | (GetUserOrganizationInvitationsParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
};

type OrganizationList = ReturnType<typeof createOrganizationList>;

type UseOrganizationListReturn =
  | {
      isLoaded: false;
      organizationList: undefined;
      createOrganization: undefined;
      setActive: undefined;
      userInvitations: PaginatedResourcesWithDefault<UserOrganizationInvitationResource>;
    }
  | {
      isLoaded: boolean;
      organizationList: OrganizationList;
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      setActive: SetActive;
      userInvitations: PaginatedResources<UserOrganizationInvitationResource>;
    };

type UseOrganizationList = (params?: UseOrganizationListParams) => UseOrganizationListReturn;

export const useOrganizationList: UseOrganizationList = params => {
  const { userInvitations } = params || {};

  const shouldUseDefaultOptions = userInvitations === true;
  const [paginatedPage, setPaginatedPage] = useState(shouldUseDefaultOptions ? 1 : userInvitations?.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(shouldUseDefaultOptions ? 1 : userInvitations?.initialPage ?? 1);
  const pageSizeRef = useRef(shouldUseDefaultOptions ? 10 : userInvitations?.pageSize ?? 10);

  const triggerInfinite = shouldUseDefaultOptions ? false : !!userInvitations?.infinite;
  const internalKeepPreviousData = shouldUseDefaultOptions ? false : !!userInvitations?.keepPreviousData;
  const internalStatus = shouldUseDefaultOptions ? 'pending' : userInvitations?.status ?? 'pending';

  const clerk = useClerkInstanceContext();
  const user = useUserContext();

  const paginatedParams =
    typeof userInvitations === 'undefined'
      ? undefined
      : {
          initialPage: paginatedPage,
          pageSize: pageSizeRef.current,
          status: internalStatus,
        };

  const canFetch = !!(clerk.loaded && user);

  const fetchInvitations = () => user!.getOrganizationInvitations(paginatedParams);

  const {
    data: userInvitationsData,
    isValidating: userInvitationsValidating,
    isLoading: userInvitationsLoading,
    error: userInvitationsError,
    mutate: userInvitationsMutate,
  } = useSWR(
    !triggerInfinite && canFetch && paginatedParams ? cacheKey('userInvitations', user, paginatedParams) : null,
    fetchInvitations,
    { keepPreviousData: internalKeepPreviousData },
  );

  const getInfiniteKey = (
    pageIndex: number,
    previousPageData: ClerkPaginatedResponse<UserOrganizationInvitationResource> | null,
  ) => {
    if (!canFetch || !paginatedParams || !triggerInfinite) {
      return null;
    }

    return cacheKey('userInvitations', user, {
      initialPage: initialPageRef.current + pageIndex,
      pageSize: pageSizeRef.current,
      status: internalStatus,
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
  } = useSWRInfinite(getInfiniteKey, ({ initialPage, pageSize, status }) => {
    return user!.getOrganizationInvitations({
      initialPage,
      pageSize,
      status,
    });
  });

  const isomorphicPage = useMemo(() => {
    if (triggerInfinite) {
      return size;
    }
    return paginatedPage;
  }, [triggerInfinite, size, paginatedPage]);

  const isomorphicSetPage: ValueOrSetter<number> = useCallback(
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
    isomorphicSetPage(n => Math.max(0, n + 1));
  }, [isomorphicSetPage]);

  const fetchPrevious = useCallback(() => {
    isomorphicSetPage(n => Math.max(0, n - 1));
  }, [isomorphicSetPage]);

  const offsetCount = (initialPageRef.current - 1) * pageSizeRef.current;

  const pageCount = Math.ceil((isomorphicCount - offsetCount) / pageSizeRef.current);
  const hasNextPage = isomorphicCount - offsetCount * pageSizeRef.current > isomorphicPage * pageSizeRef.current;
  const hasPreviousPage = (isomorphicPage - 1) * pageSizeRef.current > offsetCount * pageSizeRef.current;

  const unstable__mutate = triggerInfinite ? userInvitationsInfiniteMutate : userInvitationsMutate;

  // TODO: Properly check for SSR user values
  if (!clerk.loaded || !user) {
    return {
      isLoaded: false,
      organizationList: undefined,
      createOrganization: undefined,
      setActive: undefined,
      userInvitations: {
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
        unstable__mutate: undefined,
      },
    };
  }

  return {
    isLoaded: canFetch,
    organizationList: createOrganizationList(user.organizationMemberships),
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
    userInvitations: {
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

function createOrganizationList(organizationMemberships: OrganizationMembershipResource[]) {
  return organizationMemberships.map(organizationMembership => ({
    membership: organizationMembership,
    organization: organizationMembership.organization,
  }));
}

function cacheKey(type: 'userInvitations', user: UserResource, pagination: GetUserOrganizationInvitationsParams) {
  return {
    type,
    userId: user.id,
    initialPage: pagination.initialPage,
    pageSize: pagination.pageSize,
    status: pagination.status,
  };
}
