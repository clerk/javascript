import type {
  ClerkPaginatedResponse,
  CreateOrganizationParams,
  GetUserOrganizationInvitationsParams,
  OrganizationMembershipResource,
  OrganizationResource,
  SetActive,
  UserOrganizationInvitationResource,
} from '@clerk/types';
import { useRef } from 'react';

import { useClerkInstanceContext, useUserContext } from './contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from './types';
import { usePagesOrInfinite } from './usePagesOrInfinite';

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
          initialPage: initialPageRef.current,
          pageSize: pageSizeRef.current,
          status: internalStatus,
        };

  const isClerkLoaded = !!(clerk.loaded && user);

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
  } = usePagesOrInfinite<
    GetUserOrganizationInvitationsParams,
    ClerkPaginatedResponse<UserOrganizationInvitationResource>
  >(
    {
      ...paginatedParams,
    },
    user?.getOrganizationInvitations,
    {
      keepPreviousData: internalKeepPreviousData,
      infinite: triggerInfinite,
      enabled: !!paginatedParams,
    },
    {
      type: 'userInvitations',
      userId: user?.id,
    },
  );

  // TODO: Properly check for SSR user values
  if (!isClerkLoaded) {
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
    isLoaded: isClerkLoaded,
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
