import type { DeriveStateReturnType } from '@clerk/shared/deriveState';
import { deriveFromClientSideState, deriveFromSsrInitialState } from '@clerk/shared/deriveState';
import { createContextAndHook } from '@clerk/shared/react';
import type {
  ActClaim,
  InitialState,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  Resources,
  SessionStatusClaim,
} from '@clerk/shared/types';
import React from 'react';

export type AuthContextValue = {
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

export const [InitialAuthContext, useInitialAuthContext] = createContextAndHook<AuthContextValue | undefined>(
  'InitialAuthContext',
);
export function InitialAuthStateProvider(props: { children: React.ReactNode; initialState: InitialState | undefined }) {
  const initialAuthStateCtxValue = useDeriveAuthContext(
    props.initialState ? deriveFromSsrInitialState(props.initialState) : undefined,
  );
  return <InitialAuthContext.Provider value={initialAuthStateCtxValue}>{props.children}</InitialAuthContext.Provider>;
}

export const [AuthContext, useAuthContext] = createContextAndHook<AuthContextValue>('AuthContext');
export function AuthStateProvider(props: { children: React.ReactNode; state: Resources }) {
  const authStateCtxValue = useDeriveAuthContext(deriveFromClientSideState(props.state));
  return <AuthContext.Provider value={authStateCtxValue}>{props.children}</AuthContext.Provider>;
}

const emptyAuthCtx = { value: undefined };
// We want the types to be:
//   Pass in value known not to be undefined -> { value: AuthContextValue }
//   Pass in value that might be undefined -> { value: AuthContextValue | undefined }
type DerivedAuthContextValue<T> = { value: T extends undefined ? undefined : AuthContextValue };

// Narrow full state to only what we need for the AuthContextValue
function useDeriveAuthContext<T extends DeriveStateReturnType | undefined>(fullState: T): DerivedAuthContextValue<T> {
  const fullReturn = React.useMemo(() => {
    const value = {
      sessionId: fullState?.sessionId,
      sessionStatus: fullState?.sessionStatus,
      sessionClaims: fullState?.sessionClaims,
      userId: fullState?.userId,
      actor: fullState?.actor,
      orgId: fullState?.orgId,
      orgRole: fullState?.orgRole,
      orgSlug: fullState?.orgSlug,
      orgPermissions: fullState?.orgPermissions,
      factorVerificationAge: fullState?.factorVerificationAge,
    };
    return { value };
  }, [
    fullState?.sessionId,
    fullState?.sessionStatus,
    fullState?.sessionClaims,
    fullState?.userId,
    fullState?.actor,
    fullState?.orgId,
    fullState?.orgRole,
    fullState?.orgSlug,
    fullState?.orgPermissions,
    fullState?.factorVerificationAge,
  ]);

  if (fullState === undefined) {
    return emptyAuthCtx as DerivedAuthContextValue<T>;
  }

  return fullReturn as DerivedAuthContextValue<T>;
}
