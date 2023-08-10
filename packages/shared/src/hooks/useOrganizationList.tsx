import type {
  ClerkPaginatedResponse,
  CreateOrganizationParams,
  GetUserOrganizationInvitationsParams,
  GetUserOrganizationSuggestionsParams,
  OrganizationMembershipResource,
  OrganizationResource,
  OrganizationSuggestionResource,
  SetActive,
  UserOrganizationInvitationResource,
} from '@clerk/types';

import { useClerkInstanceContext, useUserContext } from './contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from './types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

type UseOrganizationListParams = {
  userInvitations?:
    | true
    | (GetUserOrganizationInvitationsParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
  userSuggestions?:
    | true
    | (GetUserOrganizationSuggestionsParams & {
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
      userSuggestions: PaginatedResourcesWithDefault<OrganizationSuggestionResource>;
    }
  | {
      isLoaded: boolean;
      organizationList: OrganizationList;
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      setActive: SetActive;
      userInvitations: PaginatedResources<UserOrganizationInvitationResource>;
      userSuggestions: PaginatedResources<OrganizationSuggestionResource>;
    };

type UseOrganizationList = (params?: UseOrganizationListParams) => UseOrganizationListReturn;

export const useOrganizationList: UseOrganizationList = params => {
  const { userInvitations, userSuggestions } = params || {};

  const userInvitationsSafeValues = useWithSafeValues(userInvitations, {
    initialPage: 1,
    pageSize: 10,
    status: 'pending',
    keepPreviousData: false,
    infinite: false,
  });

  const userSuggestionsSafeValues = useWithSafeValues(userSuggestions, {
    initialPage: 1,
    pageSize: 10,
    status: 'pending',
    keepPreviousData: false,
    infinite: false,
  });

  const clerk = useClerkInstanceContext();
  const user = useUserContext();

  const userInvitationsParams =
    typeof userInvitations === 'undefined'
      ? undefined
      : {
          initialPage: userInvitationsSafeValues.initialPage,
          pageSize: userInvitationsSafeValues.pageSize,
          status: userInvitationsSafeValues.status,
        };

  const userSuggestionsParams =
    typeof userSuggestions === 'undefined'
      ? undefined
      : {
          initialPage: userSuggestionsSafeValues.initialPage,
          pageSize: userSuggestionsSafeValues.pageSize,
          status: userSuggestionsSafeValues.status,
        };

  const isClerkLoaded = !!(clerk.loaded && user);

  const invitations = usePagesOrInfinite<
    GetUserOrganizationInvitationsParams,
    ClerkPaginatedResponse<UserOrganizationInvitationResource>
  >(
    {
      ...userInvitationsParams,
    },
    user?.getOrganizationInvitations,
    {
      keepPreviousData: userInvitationsSafeValues.keepPreviousData,
      infinite: userInvitationsSafeValues.infinite,
      enabled: !!userInvitationsParams,
    },
    {
      type: 'userInvitations',
      userId: user?.id,
    },
  );

  const suggestions = usePagesOrInfinite<
    GetUserOrganizationSuggestionsParams,
    ClerkPaginatedResponse<OrganizationSuggestionResource>
  >(
    {
      ...userSuggestionsParams,
    },
    user?.getOrganizationSuggestions,
    {
      keepPreviousData: userSuggestionsSafeValues.keepPreviousData,
      infinite: userSuggestionsSafeValues.infinite,
      enabled: !!userSuggestionsParams,
    },
    {
      type: 'userSuggestions',
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
      userSuggestions: {
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
    userInvitations: invitations,
    userSuggestions: suggestions,
  };
};

function createOrganizationList(organizationMemberships: OrganizationMembershipResource[]) {
  return organizationMemberships.map(organizationMembership => ({
    membership: organizationMembership,
    organization: organizationMembership.organization,
  }));
}
