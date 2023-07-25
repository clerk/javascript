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

type UseOrganizationListParams = {
  userInvitations?:
    | true
    | (GetUserOrganizationInvitationsParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
};

type OrganizationList = ReturnType<typeof createOrganizationList>;

type CustomSetAction<T = unknown> = (size: T | ((_size: T) => T)) => void;
type PaginatedDataAPI<T = unknown> = {
  data: T[];
  count: number;
  isLoadingInitial: boolean;
  isLoading: boolean;
  isError: boolean;
  page: number;
  pageCount: number;
  fetchPage: CustomSetAction<number>;
  fetchPrevious: () => void;
  fetchNext: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// Utility type to convert PaginatedDataAPI to properties as undefined, except booleans set to false
type PaginatedDataAPIWithDefaults<T> = {
  [K in keyof PaginatedDataAPI<T>]: PaginatedDataAPI<T>[K] extends boolean ? false : PaginatedDataAPI<T>[K] | undefined;
};

type UseOrganizationListReturn =
  | {
      isLoaded: false;
      organizationList: undefined;
      createOrganization: undefined;
      setActive: undefined;
      userInvitations: PaginatedDataAPIWithDefaults<UserOrganizationInvitationResource>;
    }
  | {
      isLoaded: boolean;
      organizationList: OrganizationList;
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      setActive: SetActive;
      userInvitations: PaginatedDataAPI<UserOrganizationInvitationResource>;
    };

type UseOrganizationList = (params?: UseOrganizationListParams) => UseOrganizationListReturn;

export const useOrganizationList: UseOrganizationList = params => {
  const { userInvitations } = params || {};
  const [paginatedPage, setPaginatedPage] = useState(1);

  // Cache limit and offset until unmount
  const offsetRef = useRef(userInvitations !== true ? userInvitations?.offset ?? 0 : 0);
  const limitRef = useRef(userInvitations !== true ? userInvitations?.limit ?? 10 : 10);

  const triggerInfinite = userInvitations !== true ? userInvitations?.infinite ?? false : false;
  const internalKeepPreviousData = userInvitations !== true ? userInvitations?.keepPreviousData ?? false : false;

  const clerk = useClerkInstanceContext();
  const user = useUserContext();

  const paginatedParams =
    typeof userInvitations === 'undefined'
      ? undefined
      : {
          limit: limitRef.current,
          offset: offsetRef.current + (paginatedPage - 1) * limitRef.current,
        };

  const canFetch = !!(clerk.loaded && user);

  // Some gymnastics to adhere to the rules of hooks
  // We need to make sure useSWR is called on every render
  const fetchInvitations = !clerk.loaded
    ? () => ({ data: [], total_count: 0 } as ClerkPaginatedResponse<UserOrganizationInvitationResource>)
    : () => user?.getOrganizationInvitations(paginatedParams);

  const {
    data: userInvitationsData,
    isValidating: userInvitationsValidating,
    isLoading: userInvitationsLoading,
    error: userInvitationsError,
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

    const limit = limitRef.current;
    const offset = offsetRef.current + pageIndex * limit;

    const param = {
      limit,
      offset,
    };

    return cacheKey('userInvitations', user, param);
  };

  const {
    data: userInvitationsDataInfinite,
    isLoading: userInvitationsLoadingInfinite,
    isValidating: userInvitationsInfiniteValidating,
    error: userInvitationsInfiniteError,
    size,
    setSize,
  } = useSWRInfinite(getInfiniteKey, str => {
    const { offset, limit } = JSON.parse(str);

    return !clerk.loaded || !user
      ? ({ data: [], total_count: 0 } as ClerkPaginatedResponse<UserOrganizationInvitationResource>)
      : user.getOrganizationInvitations({
          offset: parseInt(offset),
          limit: parseInt(limit),
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

  /**
   * Helpers
   */
  const fetchNext = useCallback(() => {
    isomorphicSetPage(n => n + 1);
  }, [isomorphicSetPage]);

  const fetchPrevious = useCallback(() => {
    isomorphicSetPage(n => n - 1);
  }, [isomorphicSetPage]);

  const pageCount = Math.ceil((isomorphicCount - offsetRef.current) / limitRef.current);
  const hasNextPage = isomorphicCount - offsetRef.current > isomorphicPage * limitRef.current;
  const hasPreviousPage = (isomorphicPage - 1) * limitRef.current > offsetRef.current;

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
        isLoadingInitial: false,
        isLoading: false,
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
    isLoaded: canFetch,
    organizationList: createOrganizationList(user.organizationMemberships),
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
    userInvitations: triggerInfinite
      ? {
          data: isomorphicData,
          count: isomorphicCount,
          isLoadingInitial: userInvitationsLoadingInfinite,
          isLoading: userInvitationsInfiniteValidating,
          isError: !!userInvitationsInfiniteError,
          page: isomorphicPage,
          pageCount,
          fetchPage: isomorphicSetPage,
          fetchNext,
          fetchPrevious,
          hasNextPage,
          hasPreviousPage,
        }
      : {
          data: isomorphicData,
          count: isomorphicCount,
          isLoadingInitial: userInvitationsLoading,
          isError: !!userInvitationsError,
          isLoading: userInvitationsValidating,
          page: isomorphicPage,
          pageCount,
          fetchPage: isomorphicSetPage,
          fetchNext,
          fetchPrevious,
          hasNextPage,
          hasPreviousPage,
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
  return JSON.stringify({
    type,
    userId: user.id,
    offset: pagination.offset,
    limit: pagination.limit,
  });
}
