import type { DeriveStateReturnType } from '@clerk/shared/deriveState';
import { deriveFromClientSideState, deriveFromSsrInitialState } from '@clerk/shared/deriveState';
import { useClerkInstanceContext, useInitialStateContext } from '@clerk/shared/react';
import type {
  ActClaim,
  ClientResource,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  SessionStatusClaim,
} from '@clerk/shared/types';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

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
  const clerk = useClerkInstanceContext();
  const initialStateContext = useInitialStateContext();
  // If we make initialState support a promise in the future, this is where we would use() that promise
  const initialSnapshot = useMemo(() => {
    if (!initialStateContext) {
      return defaultDerivedInitialState;
    }
    const fullState = deriveFromSsrInitialState(initialStateContext);
    return authStateFromFull(fullState);
  }, [initialStateContext]);

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
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => snapshot, [snapshot]),
    useCallback(() => initialSnapshot, [initialSnapshot]),
  );

  return authState;
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
