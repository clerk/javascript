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

import { eventMethodCalled } from '../../telemetry/events/method-called';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useUserContext } from '../contexts';
import type { PaginatedHookConfig, PaginatedResources, PaginatedResourcesWithDefault } from '../types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

type UseOrganizationListParams = {
  /**
   * `true` or an object with any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization-list#shared-properties). If set to `true`, all default properties will be used.
   */
  userMemberships?: true | PaginatedHookConfig<GetUserOrganizationMembershipParams>;
  /**
   * `true` or an object with [`status: OrganizationInvitationStatus`](https://clerk.com/docs/references/react/use-organization-list#organization-invitation-status) or any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization-list#shared-properties). If set to `true`, all default properties will be used.
   */
  userInvitations?: true | PaginatedHookConfig<GetUserOrganizationInvitationsParams>;
  /**
   * `true` or an object with [`status: OrganizationSuggestionsStatus | OrganizationSuggestionStatus[]`](https://clerk.com/docs/references/react/use-organization-list#organization-suggestion-status) or any of the properties described in [Shared properties](https://clerk.com/docs/references/react/use-organization-list#shared-properties). If set to `true`, all default properties will be used.
   */
  userSuggestions?: true | PaginatedHookConfig<GetUserOrganizationSuggestionsParams>;
};

const undefinedPaginatedResource = {
  data: undefined,
  count: undefined,
  error: undefined,
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * A function that returns a `Promise` which resolves to the newly created `Organization`.
       */
      createOrganization: undefined;
      /**
       * A function that sets the active session and/or organization.
       */
      setActive: undefined;
      /**
       * Returns `PaginatedResources` which includes a list of the user's organization memberships.
       */
      userMemberships: PaginatedResourcesWithDefault<OrganizationMembershipResource>;
      /**
       * Returns `PaginatedResources` which includes a list of the user's organization invitations.
       */
      userInvitations: PaginatedResourcesWithDefault<UserOrganizationInvitationResource>;
      /**
       * Returns `PaginatedResources` which includes a list of suggestions for organizations that the user can join.
       */
      userSuggestions: PaginatedResourcesWithDefault<OrganizationSuggestionResource>;
    }
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: boolean;
      /**
       * A function that returns a `Promise` which resolves to the newly created `Organization`.
       */
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      /**
       * A function that sets the active session and/or organization.
       */
      setActive: SetActive;
      /**
       * Returns `PaginatedResources` which includes a list of the user's organization memberships.
       */
      userMemberships: PaginatedResources<
        OrganizationMembershipResource,
        T['userMemberships'] extends { infinite: true } ? true : false
      >;
      /**
       * Returns `PaginatedResources` which includes a list of the user's organization invitations.
       */
      userInvitations: PaginatedResources<
        UserOrganizationInvitationResource,
        T['userInvitations'] extends { infinite: true } ? true : false
      >;
      /**
       * Returns `PaginatedResources` which includes a list of suggestions for organizations that the user can join.
       */
      userSuggestions: PaginatedResources<
        OrganizationSuggestionResource,
        T['userSuggestions'] extends { infinite: true } ? true : false
      >;
    };

/**
 * The `useOrganizationList()` hook provides access to the current user's organization memberships, invitations, and suggestions. It also includes methods for creating new organizations and managing the active organization.
 */
export const useOrganizationList: UseOrganizationList = params => {
  const { userMemberships, userInvitations, userSuggestions } = params || {};

  useAssertWrappedByClerkProvider('useOrganizationList');

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

  clerk.telemetry?.record(eventMethodCalled('useOrganizationList'));

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
    userMembershipsParams || {},
    user?.getOrganizationMemberships,
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
      createOrganization: undefined,
      setActive: undefined,
      userMemberships: undefinedPaginatedResource,
      userInvitations: undefinedPaginatedResource,
      userSuggestions: undefinedPaginatedResource,
    };
  }

  return {
    isLoaded: isClerkLoaded,
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
    userMemberships: memberships,
    userInvitations: invitations,
    userSuggestions: suggestions,
  };
};
