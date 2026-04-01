import { deriveState, type DeriveStateReturnType } from '@clerk/shared/deriveState';
import { useClerkInstanceContext, useInitialStateContext } from '@clerk/shared/react';
import type {
  ActClaim,
  InitialState,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  Resources,
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

export function useAuthBase(): AuthStateValue {
  const clerk = useClerkInstanceContext();
  const initialState = useInitialStateContext();
  const getInitialState = useCallback(() => initialState, [initialState]);

  const state = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded || !clerk.__internal_lastEmittedResources) {
        return getInitialState();
      }

      return clerk.__internal_lastEmittedResources;
    }, [clerk, getInitialState]),
    getInitialState,
  );

  const authState = useMemo(() => {
    if (!state) {
      return defaultDerivedInitialState;
    }
    const fullState = isInitialState(state)
      ? deriveState(false, {} as Resources, state)
      : deriveState(true, state, undefined);
    return authStateFromFull(fullState);
  }, [state]);

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

function isInitialState(state: Resources | InitialState): state is InitialState {
  return !('client' in state);
}
