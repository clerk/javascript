import type {
  ActJWTClaim,
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  OrganizationCustomRoleKey,
  SignOut,
} from '@clerk/types';
import { useCallback } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { errorThrower } from '../errors/errorThrower';
import { invalidStateError } from '../errors/messages';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';
import { createGetToken, createSignOut } from './utils';

type CheckAuthorizationSignedOut = undefined;
type CheckAuthorizationWithoutOrgOrUser = (params?: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => false;

type UseAuthReturn =
  | {
      isLoaded: false;
      isSignedIn: undefined;
      userId: undefined;
      sessionId: undefined;
      actor: undefined;
      orgId: undefined;
      orgRole: undefined;
      orgSlug: undefined;
      has: CheckAuthorizationSignedOut;
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
      has: CheckAuthorizationWithoutOrgOrUser;
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
      has: CheckAuthorizationWithCustomPermissions;
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
      orgRole: OrganizationCustomRoleKey;
      orgSlug: string | null;
      has: CheckAuthorizationWithCustomPermissions;
      signOut: SignOut;
      getToken: GetToken;
    };

type UseAuth = () => UseAuthReturn;

const stringsToNumbers: { [key in '1m' | '10m' | '1h' | '4h' | '1d' | '1w']: number } = {
  '1m': 1,
  '10m': 10,
  '1h': 60,
  '4h': 240, //4 * 60,
  '1d': 1440, //24 * 60,
  '1w': 10080, //7 * 24 * 60,
};

/**
 * Returns the current auth state, the user and session ids and the `getToken`
 * that can be used to retrieve the given template or the default Clerk token.
 *
 * Until Clerk loads, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access the `userId` and `sessionId` variables.
 *
 * For projects using NextJs or Remix, you can have immediate access to this data during SSR
 * simply by using the `ClerkProvider`.
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
 *
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 */
export const useAuth: UseAuth = () => {
  useAssertWrappedByClerkProvider('useAuth');

  const { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions, __experimental_factorVerificationAge } =
    useAuthContext();
  const isomorphicClerk = useIsomorphicClerkContext();

  const getToken: GetToken = useCallback(createGetToken(isomorphicClerk), [isomorphicClerk]);
  const signOut: SignOut = useCallback(createSignOut(isomorphicClerk), [isomorphicClerk]);

  const has = useCallback(
    (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => {
      // if (!params?.permission && !params?.role) {
      //   errorThrower.throw(useAuthHasRequiresRoleOrPermission);
      // }

      let orgAuthorization = null;
      let stepUpAuthorization = null;

      if (!userId) {
        return false;
      }
      if (params.role || params.permission) {
        const missingOrgs = !orgId || !orgRole || !orgPermissions;

        if (params.permission && !missingOrgs) {
          orgAuthorization = orgPermissions.includes(params.permission);
        }

        if (params.role && !missingOrgs) {
          orgAuthorization = orgRole === params.role;
        }
      }

      if (params.__experimental_assurance && __experimental_factorVerificationAge) {
        const hasValidFactorOne =
          __experimental_factorVerificationAge[0] !== null
            ? stringsToNumbers[params.__experimental_assurance.maxAge] > __experimental_factorVerificationAge[0]
            : false;
        const hasValidFactorTwo =
          __experimental_factorVerificationAge[1] !== null
            ? stringsToNumbers[params.__experimental_assurance.maxAge] > __experimental_factorVerificationAge[1]
            : false;

        if (params.__experimental_assurance.level === 'firstFactor') {
          stepUpAuthorization = hasValidFactorOne;
        } else if (params.__experimental_assurance.level === 'secondFactor') {
          stepUpAuthorization = hasValidFactorTwo;
        } else {
          stepUpAuthorization = hasValidFactorOne && hasValidFactorTwo;
        }
      }

      return [orgAuthorization, stepUpAuthorization].filter(Boolean).some(a => a === true);
    },
    [userId, __experimental_factorVerificationAge, orgId, orgRole, orgPermissions],
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
      has: undefined,
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
      has: () => false,
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
      orgRole,
      orgSlug: orgSlug || null,
      has,
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
      has,
      signOut,
      getToken,
    };
  }

  return errorThrower.throw(invalidStateError);
};
