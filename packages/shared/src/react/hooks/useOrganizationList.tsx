import { eventMethodCalled } from '../../telemetry/events/method-called';
import type {
  CreateOrganizationParams,
  GetUserOrganizationInvitationsParams,
  GetUserOrganizationMembershipParams,
  GetUserOrganizationSuggestionsParams,
  OrganizationMembershipResource,
  OrganizationResource,
  OrganizationSuggestionResource,
  SetActive,
  UserOrganizationInvitationResource,
} from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useUserContext } from '../contexts';
import type { PaginatedHookConfig, PaginatedResources, PaginatedResourcesWithDefault } from '../types';
import { createCacheKeys } from './createCacheKeys';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

/**
 * @interface
 */
export type UseOrganizationListParams = {
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   *
   * <ul>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  userMemberships?: true | PaginatedHookConfig<GetUserOrganizationMembershipParams>;
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   *
   * <ul>
   *  <li>`status`: A string that filters the invitations by the provided status.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
   */
  userInvitations?: true | PaginatedHookConfig<GetUserOrganizationInvitationsParams>;
  /**
   * If set to `true`, all default properties will be used.<br />
   * Otherwise, accepts an object with the following optional properties:
   *
   * <ul>
   *  <li>`status`: A string that filters the suggestions by the provided status.</li>
   *  <li>Any of the properties described in [Shared properties](#shared-properties).</li>
   * </ul>
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

/**
 * @interface
 */
export type UseOrganizationListReturn<T extends UseOrganizationListParams> =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization and there is an authenticated user. Initially `false`, becomes `true` once Clerk loads with a user.
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
      isLoaded: boolean;
      createOrganization: (CreateOrganizationParams: CreateOrganizationParams) => Promise<OrganizationResource>;
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

/**
 * The `useOrganizationList()` hook provides access to the current user's organization memberships, invitations, and suggestions. It also includes methods for creating new organizations and managing the active organization.
 *
 * @example
 * ### Expanding and paginating attributes
 *
 * To keep network usage to a minimum, developers are required to opt-in by specifying which resource they need to fetch and paginate through. So by default, the `userMemberships`, `userInvitations`, and `userSuggestions` attributes are not populated. You must pass true or an object with the desired properties to fetch and paginate the data.
 *
 * ```tsx
 * // userMemberships.data will never be populated
 * const { userMemberships } = useOrganizationList()
 *
 * // Use default values to fetch userMemberships, such as initialPage = 1 and pageSize = 10
 * const { userMemberships } = useOrganizationList({
 *   userMemberships: true,
 * })
 *
 * // Pass your own values to fetch userMemberships
 * const { userMemberships } = useOrganizationList({
 *   userMemberships: {
 *     pageSize: 20,
 *     initialPage: 2, // skips the first page
 *   },
 * })
 *
 * // Aggregate pages in order to render an infinite list
 * const { userMemberships } = useOrganizationList({
 *   userMemberships: {
 *     infinite: true,
 *   },
 * })
 * ```
 *
 * @example
 * ### Infinite pagination
 *
 * The following example demonstrates how to use the `infinite` property to fetch and append new data to the existing list. The `userMemberships` attribute will be populated with the first page of the user's organization memberships. When the "Load more" button is clicked, the `fetchNext` helper function will be called to append the next page of memberships to the list.
 *
 * ```tsx {{ filename: 'src/components/JoinedOrganizations.tsx' }}
 * import { useOrganizationList } from '@clerk/clerk-react'
 * import React from 'react'
 *
 * const JoinedOrganizations = () => {
 *   const { isLoaded, setActive, userMemberships } = useOrganizationList({
 *     userMemberships: {
 *       infinite: true,
 *     },
 *   })
 *
 *   if (!isLoaded) {
 *     return <>Loading</>
 *   }
 *
 *   return (
 *     <>
 *       <ul>
 *         {userMemberships.data?.map((mem) => (
 *           <li key={mem.id}>
 *             <span>{mem.organization.name}</span>
 *             <button onClick={() => setActive({ organization: mem.organization.id })}>Select</button>
 *           </li>
 *         ))}
 *       </ul>
 *
 *       <button disabled={!userMemberships.hasNextPage} onClick={() => userMemberships.fetchNext()}>
 *         Load more
 *       </button>
 *     </>
 *   )
 * }
 *
 * export default JoinedOrganizations
 * ```
 *
 * @example
 * ### Simple pagination
 *
 * The following example demonstrates how to use the `fetchPrevious` and `fetchNext` helper functions to paginate through the data. The `userInvitations` attribute will be populated with the first page of invitations. When the "Previous page" or "Next page" button is clicked, the `fetchPrevious` or `fetchNext` helper function will be called to fetch the previous or next page of invitations.
 *
 * Notice the difference between this example's pagination and the infinite pagination example above.
 *
 * ```tsx {{ filename: 'src/components/UserInvitationsTable.tsx' }}
 * import { useOrganizationList } from '@clerk/clerk-react'
 * import React from 'react'
 *
 * const UserInvitationsTable = () => {
 *   const { isLoaded, userInvitations } = useOrganizationList({
 *     userInvitations: {
 *       infinite: true,
 *       keepPreviousData: true,
 *     },
 *   })
 *
 *   if (!isLoaded || userInvitations.isLoading) {
 *     return <>Loading</>
 *   }
 *
 *   return (
 *     <>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Email</th>
 *             <th>Org name</th>
 *           </tr>
 *         </thead>
 *
 *         <tbody>
 *           {userInvitations.data?.map((inv) => (
 *             <tr key={inv.id}>
 *               <th>{inv.emailAddress}</th>
 *               <th>{inv.publicOrganizationData.name}</th>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *
 *       <button disabled={!userInvitations.hasPreviousPage} onClick={userInvitations.fetchPrevious}>
 *         Prev
 *       </button>
 *       <button disabled={!userInvitations.hasNextPage} onClick={userInvitations.fetchNext}>
 *         Next
 *       </button>
 *     </>
 *   )
 * }
 *
 * export default UserInvitationsTable
 * ```
 */
export function useOrganizationList<T extends UseOrganizationListParams>(params?: T): UseOrganizationListReturn<T> {
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

  const memberships = usePagesOrInfinite({
    fetcher: user?.getOrganizationMemberships,
    config: {
      keepPreviousData: userMembershipsSafeValues.keepPreviousData,
      infinite: userMembershipsSafeValues.infinite,
      enabled: !!userMembershipsParams,
      isSignedIn: Boolean(user),
      initialPage: userMembershipsSafeValues.initialPage,
      pageSize: userMembershipsSafeValues.pageSize,
    },
    keys: createCacheKeys({
      stablePrefix: 'userMemberships',
      authenticated: Boolean(user),
      tracked: {
        userId: user?.id,
      },
      untracked: {
        args: userMembershipsParams,
      },
    }),
  });

  const invitations = usePagesOrInfinite({
    fetcher: user?.getOrganizationInvitations,
    config: {
      keepPreviousData: userInvitationsSafeValues.keepPreviousData,
      infinite: userInvitationsSafeValues.infinite,
      // In useOrganizationList, you need to opt in by passing an object or `true`.
      enabled: !!userInvitationsParams,
      isSignedIn: Boolean(user),
      initialPage: userInvitationsSafeValues.initialPage,
      pageSize: userInvitationsSafeValues.pageSize,
    },
    keys: createCacheKeys({
      stablePrefix: 'userInvitations',
      authenticated: Boolean(user),
      tracked: {
        userId: user?.id,
      },
      untracked: {
        args: userInvitationsParams,
      },
    }),
  });

  const suggestions = usePagesOrInfinite({
    fetcher: user?.getOrganizationSuggestions,
    config: {
      keepPreviousData: userSuggestionsSafeValues.keepPreviousData,
      infinite: userSuggestionsSafeValues.infinite,
      enabled: !!userSuggestionsParams,
      isSignedIn: Boolean(user),
      initialPage: userSuggestionsSafeValues.initialPage,
      pageSize: userSuggestionsSafeValues.pageSize,
    },
    keys: createCacheKeys({
      stablePrefix: 'userSuggestions',
      authenticated: Boolean(user),
      tracked: {
        userId: user?.id,
      },
      untracked: {
        args: userSuggestionsParams,
      },
    }),
  });

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
}
