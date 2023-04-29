import type { ActJWTClaim, GetToken, MembershipRole, SignOut } from '@clerk/types';
import { invalidStateError } from '@clerk/utils';
import type { Accessor } from 'solid-js';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import type IsomorphicClerk from '../isomorphicClerk';
import { createGetToken, createSignOut } from './utils';

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
      orgRole: MembershipRole;
      orgSlug: string | null;
      signOut: SignOut;
      getToken: GetToken;
    };

type UseAuth = () => Accessor<UseAuthReturn>;

export const createAuth: UseAuth = () => {
  const authCtx = useAuthContext();
  const isomorphicClerk = useIsomorphicClerkContext() as unknown as IsomorphicClerk;

  const getToken: GetToken = createGetToken(isomorphicClerk);
  const signOut: SignOut = createSignOut(isomorphicClerk);

  return () => {
    const { userId, sessionId, actor, orgId, orgRole, orgSlug } = authCtx();
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
        signOut,
        getToken,
      };
    }
    throw new Error(invalidStateError);
  };
};
