import type { DeriveStateReturnType } from '@clerk/shared/deriveState';
import { deriveFromClientSideState, deriveFromSsrInitialState } from '@clerk/shared/deriveState';
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
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

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
  const initialStateFromContextRaw = useInitialStateContext();

  // This is never allowed to change, so we snapshot it to guarantee that
  // eslint-disable-next-line react/hook-use-state
  const [initialStateFromContext] = useState(initialStateFromContextRaw);

  const state = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded || !clerk.__internal_lastEmittedResources) {
        return initialStateFromContext;
      }

      return clerk.__internal_lastEmittedResources;
      // We do not want to include __internal_lastEmittedResources in the dependency array as that is not reactive,
      // in the future we should useEffectEvent for this, but it's only available in React 19.
      // clerk only changes identity when it's status changes, so reads to __internal_lastEmittedResources will
      // always return the latest value, which is what we want.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clerk.loaded, initialStateFromContext]),
    useCallback(() => initialStateFromContext, [initialStateFromContext]),
  );

  const authState = useMemo(() => {
    if (!state) {
      return defaultDerivedInitialState;
    }
    const fullState = isInitialState(state) ? deriveFromSsrInitialState(state) : deriveFromClientSideState(state);
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
