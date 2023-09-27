import type {
  ClerkPaginatedResponse,
  CreateOrganizationParams,
  GetUserOrganizationInvitationsParams,
  GetUserOrganizationMembershipParams,
  GetUserOrganizationSuggestionsParams,
  OrganizationMembershipResource,
  OrganizationResource,
  OrganizationSuggestionResource,
  SetActive,
  UserOrganizationInvitationResource,
} from '@clerk/types';

import { deprecated } from '../utils';
import { useClerkInstanceContext, useUserContext } from './contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from './types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

type UseOrganizationListParams = {
  userMemberships?:
    | true
    | (GetUserOrganizationMembershipParams & {
        infinite?: boolean;
        keepPreviousData?: boolean;
      });
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
      /**
       * @deprecated Use userMemberships instead
       */
      organizationList: undefined;
      createOrganization: undefined;
      setActive: undefined;
      userMemberships: PaginatedResourcesWithDefault<OrganizationMembershipResource>;
      userInvitations: PaginatedResourcesWithDefault<UserOrganizationInvitationResource>;
      userSuggestions: PaginatedResourcesWithDefault<OrganizationSuggestionResource>;
    }
  | {
      isLoaded: boolean;
      /**
       * @deprecated Use userMemberships instead
       */
      organizationList: OrganizationList;
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      setActive: SetActive;
      userMemberships: PaginatedResources<OrganizationMembershipResource>;
      userInvitations: PaginatedResources<UserOrganizationInvitationResource>;
      userSuggestions: PaginatedResources<OrganizationSuggestionResource>;
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
  unstable__mutate: undefined,
} as const;

type UseOrganizationList = (params?: UseOrganizationListParams) => UseOrganizationListReturn;

export const useOrganizationList: UseOrganizationList = params => {
  const { userMemberships, userInvitations, userSuggestions } = params || {};

  const userMembershipsSafeValues = useWithSafeValues(userMemberships, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
  });

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

  const userMembershipsParams =
    typeof userMemberships === 'undefined'
      ? undefined
      : {
          initialPage: userMembershipsSafeValues.initialPage,
          pageSize: userMembershipsSafeValues.pageSize,
        };

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

  const memberships = usePagesOrInfinite<
    GetUserOrganizationMembershipParams,
    ClerkPaginatedResponse<OrganizationMembershipResource>
  >(
    {
      ...userMembershipsParams,
      paginated: true,
    } as any,
    user?.getOrganizationMemberships as unknown as any,
    {
      keepPreviousData: userMembershipsSafeValues.keepPreviousData,
      infinite: userMembershipsSafeValues.infinite,
      enabled: !!userMembershipsParams,
    },
    {
      type: 'userMemberships',
      userId: user?.id,
    },
  );

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
      userMemberships: undefinedPaginatedResource,
      userInvitations: undefinedPaginatedResource,
      userSuggestions: undefinedPaginatedResource,
    };
  }

  return {
    isLoaded: isClerkLoaded,
    organizationList: createOrganizationList(user.organizationMemberships),
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
    userMemberships: memberships,
    userInvitations: invitations,
    userSuggestions: suggestions,
  };
};

function createOrganizationList(organizationMemberships: OrganizationMembershipResource[]) {
  deprecated('organizationList', 'Use `userMemberships` instead.');
  return organizationMemberships.map(organizationMembership => ({
    membership: organizationMembership,
    organization: organizationMembership.organization,
  }));
}
