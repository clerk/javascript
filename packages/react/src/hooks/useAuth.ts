import type {
  ActJWTClaim,
  experimental__CheckAuthorizationWithCustomPermissions,
  GetToken,
  MembershipRole,
  SignOut,
} from '@clerk/types';
import { useCallback } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { invalidStateError } from '../errors';
import type { IsomorphicClerk } from '../isomorphicClerk';
import { errorThrower } from '../utils';
import { createGetToken, createSignOut } from './utils';

type experimental__CheckAuthorizationSignedOut = (
  params?: Parameters<experimental__CheckAuthorizationWithCustomPermissions>[0],
) => false;

type UseAuthReturn<Role extends string = string, Permission extends string = string> =
  | {
      isLoaded: false;
      isSignedIn: undefined;
      userId: undefined;
      sessionId: undefined;
      actor: undefined;
      orgId: undefined;
      orgRole: undefined;
      orgSlug: undefined;
      /**
       * @experimental The method is experimental and subject to change in future releases.
       */
      experimental__has: experimental__CheckAuthorizationSignedOut;
      signOut: SignOut;
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: false;
      userId: null;
      sessionId: null;
      actor: null;
      orgId: null;
      orgRole: null;
      orgSlug: null;
      /**
       * @experimental The method is experimental and subject to change in future releases.
       */
      experimental__has: experimental__CheckAuthorizationSignedOut;
      signOut: SignOut;
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: true;
      userId: string;
      sessionId: string;
      actor: ActJWTClaim | null;
      orgId: null;
      orgRole: null;
      orgSlug: null;
      /**
       * @experimental The method is experimental and subject to change in future releases.
       */
      experimental__has: experimental__CheckAuthorizationSignedOut;
      signOut: SignOut;
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: true;
      userId: string;
      sessionId: string;
      actor: ActJWTClaim | null;
      orgId: string;
      orgRole: Role;
      orgSlug: string | null;
      /**
       * @experimental The method is experimental and subject to change in future releases.
       */
      experimental__has: experimental__CheckAuthorizationWithCustomPermissions<Role, Permission>;
      signOut: SignOut;
      getToken: GetToken;
    };

type UseAuth = <Role extends string = string, Permission extends string = string>() => UseAuthReturn<Role, Permission>;

/**
 * Returns the current auth state, the user and session ids and the `getToken`
 * that can be used to retrieve the given template or the default Clerk token.
 *
 * Until Clerk loads, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access the `userId` and `sessionId` variables.
 *
 * For projects using NextJs or Remix, you can have immediate access to this data  during SSR
 * simply by using the `withServerSideAuth` helper.
 *
 * @example
 * A simple example:
 *
 * import { useAuth } from '@clerk/clerk-react'
 *
 * function Hello() {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   if(isSignedIn) {
 *     return null;
 *   }
 *   console.log(sessionId, userId)
 *   return <div>...</div>
 * }
 *
 * @example
 * Basic example in a NextJs app. This page will be fully rendered during SSR:
 *
 * import { useAuth } from '@clerk/nextjs'
 * import { withServerSideAuth } from '@clerk/nextjs/api'
 *
 * export getServerSideProps = withServerSideAuth();
 *
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 */
export const useAuth: UseAuth = <Role extends string = string, Permission extends string = string>() => {
  const { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions } = useAuthContext();
  const isomorphicClerk = useIsomorphicClerkContext() as unknown as IsomorphicClerk;

  const getToken: GetToken = useCallback(createGetToken(isomorphicClerk), [isomorphicClerk]);
  const signOut: SignOut = useCallback(createSignOut(isomorphicClerk), [isomorphicClerk]);

  const has = useCallback(
    (params?: Parameters<experimental__CheckAuthorizationWithCustomPermissions<Role, Permission>>[0]) => {
      if (!orgId || !userId || !orgRole || !orgPermissions) {
        return false;
      }

      if (!params) {
        return false;
      }

      if (params.permission) {
        return orgPermissions.includes(params.permission);
      }

      if (params.role) {
        return orgRole === params.role;
      }

      if (params.some) {
        return !!params.some.find(permObj => {
          if (permObj.permission) {
            return orgPermissions.includes(permObj.permission);
          }
          if (permObj.role) {
            return orgRole === permObj.role;
          }
          return false;
        });
      }
      return false;
    },
    [orgId, orgRole, userId, orgPermissions],
  );

  if (sessionId === undefined && userId === undefined) {
    return {
      isLoaded: false,
      isSignedIn: undefined,
      sessionId,
      userId,
      actor: undefined,
      orgId: undefined,
      orgRole: undefined,
      orgSlug: undefined,
      experimental__has: () => false,
      signOut,
      getToken,
    };
  }

  if (sessionId === null && userId === null) {
    return {
      isLoaded: true,
      isSignedIn: false,
      sessionId,
      userId,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      experimental__has: () => false,
      signOut,
      getToken,
    };
  }

  if (!!sessionId && !!userId && !!orgId && !!orgRole) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      userId,
      actor: actor || null,
      orgId,
      orgRole: orgRole as Role,
      orgSlug: orgSlug || null,
      experimental__has: has,
      signOut,
      getToken,
    };
  }

  if (!!sessionId && !!userId && !orgId) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      userId,
      actor: actor || null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      experimental__has: () => false,
      signOut,
      getToken,
    };
  }

  return errorThrower.throw(invalidStateError);
};
