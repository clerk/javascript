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

import { deprecatedObjectProperty } from '../../deprecated';
import { useClerkInstanceContext, useUserContext } from '../contexts';
import type { PaginatedResources, PaginatedResourcesWithDefault } from '../types';
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

type UseOrganizationList = <T extends UseOrganizationListParams>(
  params?: T,
) =>
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
      userMemberships: PaginatedResources<
        OrganizationMembershipResource,
        T['userMemberships'] extends { infinite: true } ? true : false
      >;
      userInvitations: PaginatedResources<
        UserOrganizationInvitationResource,
        T['userInvitations'] extends { infinite: true } ? true : false
      >;
      userSuggestions: PaginatedResources<
        OrganizationSuggestionResource,
        T['userSuggestions'] extends { infinite: true } ? true : false
      >;
    };

const __unstable__revalidationParams = {
  __unstable__dependencyRevalidation: true,
  __unstable__defaultRevalidateOnEvents: ['organization:deleted', 'organization:created', 'user:membership_deleted'],
};

export const useOrganizationList: UseOrganizationList = params => {
  const { userMemberships, userInvitations, userSuggestions } = params || {};

  const userMembershipsSafeValues = useWithSafeValues(userMemberships, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
    ...__unstable__revalidationParams,
  });

  const userInvitationsSafeValues = useWithSafeValues(userInvitations, {
    initialPage: 1,
    pageSize: 10,
    status: 'pending',
    keepPreviousData: false,
    infinite: false,
    ...__unstable__revalidationParams,
  });

  const userSuggestionsSafeValues = useWithSafeValues(userSuggestions, {
    initialPage: 1,
    pageSize: 10,
    status: 'pending',
    keepPreviousData: false,
    infinite: false,
    ...__unstable__revalidationParams,
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
      __unstable__dependencyRevalidation: userMembershipsSafeValues.__unstable__dependencyRevalidation,
      __unstable__defaultRevalidateOnEvents: userMembershipsSafeValues.__unstable__defaultRevalidateOnEvents,
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
      __unstable__dependencyRevalidation: userInvitationsSafeValues.__unstable__dependencyRevalidation,
      __unstable__defaultRevalidateOnEvents: userInvitationsSafeValues.__unstable__defaultRevalidateOnEvents,
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
      __unstable__dependencyRevalidation: userSuggestionsSafeValues.__unstable__dependencyRevalidation,
      __unstable__defaultRevalidateOnEvents: userSuggestionsSafeValues.__unstable__defaultRevalidateOnEvents,
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

  const result = {
    isLoaded: isClerkLoaded,
    organizationList: createOrganizationList(user.organizationMemberships),
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
    userMemberships: memberships,
    userInvitations: invitations,
    userSuggestions: suggestions,
  };
  deprecatedObjectProperty(result, 'organizationList', 'Use `userMemberships` instead.');

  return result;
};

function createOrganizationList(organizationMemberships: OrganizationMembershipResource[]) {
  return organizationMemberships.map(organizationMembership => ({
    membership: organizationMembership,
    organization: organizationMembership.organization,
  }));
}
