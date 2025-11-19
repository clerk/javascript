import type { DeriveStateReturnType } from '@clerk/shared/deriveState';
import { deriveFromClientSideState, deriveFromSsrInitialState } from '@clerk/shared/deriveState';
import { createContextAndHook } from '@clerk/shared/react';
import type {
  ActClaim,
  ClientResource,
  InitialState,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  SessionStatusClaim,
} from '@clerk/shared/types';
import React, { useCallback, useDeferredValue, useMemo, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from './IsomorphicClerkContext';

type AuthStateValue = {
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  sessionStatus: SessionStatusClaim | null | undefined;
  sessionClaims: JwtPayload | null | undefined;
  actor: ActClaim | null | undefined;
  orgId: string | null | undefined;
  orgRole: OrganizationCustomRoleKey | null | undefined;
  orgSlug: string | null | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
  factorVerificationAge: [number, number] | null;
};

const [InitialAuthContext, useInitialAuthContext] = createContextAndHook<InitialState | undefined>(
  'InitialAuthContext',
);
export function InitialAuthStateProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: InitialState | undefined;
}) {
  const initialStateCtx = useMemo(() => ({ value: initialState }), [initialState]);
  return <InitialAuthContext.Provider value={initialStateCtx}>{children}</InitialAuthContext.Provider>;
}

export const defaultDerivedInitialState = {
  actor: undefined,
  factorVerificationAge: null,
  orgId: undefined,
  orgPermissions: undefined,
  orgRole: undefined,
  orgSlug: undefined,
  sessionClaims: undefined,
  sessionId: undefined,
  sessionStatus: undefined,
  userId: undefined,
};

export function useAuthState(): AuthStateValue {
  const clerk = useIsomorphicClerkContext();
  const initialAuthContext = useInitialAuthContext();
  // If we make initialState support a promise in the future, this is where we would use() that promise
  const initialSnapshot = useMemo(() => {
    if (!initialAuthContext) {
      return defaultDerivedInitialState;
    }
    const fullState = deriveFromSsrInitialState(initialAuthContext);
    return authStateFromFull(fullState);
  }, [initialAuthContext]);

  const snapshot = useMemo(() => {
    if (!clerk.loaded) {
      return initialSnapshot;
    }
    const state = {
      client: clerk.client as ClientResource,
      session: clerk.session,
      user: clerk.user,
      organization: clerk.organization,
    };
    const fullState = deriveFromClientSideState(state);
    return authStateFromFull(fullState);
  }, [clerk.client, clerk.session, clerk.user, clerk.organization, initialSnapshot, clerk.loaded]);

  const authState = useSyncExternalStore(
    clerk.addListener,
    useCallback(() => snapshot, [snapshot]),
    useCallback(() => initialSnapshot, [initialSnapshot]),
  );

  // If an updates comes in during a transition, uSES usually deopts that transition to be synchronous,
  // which for example means that already mounted <Suspense> boundaries might suddenly show their fallback.
  // This makes all auth state changes into transitions, but does not deopt to be synchronous. If it's
  // called during a transition, it immediately uses the new value without deferring.
  return useDeferredValue(authState);
}

function authStateFromFull(derivedState: DeriveStateReturnType) {
  return {
    sessionId: derivedState.sessionId,
    sessionStatus: derivedState.sessionStatus,
    sessionClaims: derivedState.sessionClaims,
    userId: derivedState.userId,
    actor: derivedState.actor,
    orgId: derivedState.orgId,
    orgRole: derivedState.orgRole,
    orgSlug: derivedState.orgSlug,
    orgPermissions: derivedState.orgPermissions,
    factorVerificationAge: derivedState.factorVerificationAge,
  };
}
