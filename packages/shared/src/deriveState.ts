import type {
  InitialState,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  OrganizationResource,
  Resources,
  SignedInSessionResource,
  UserResource,
} from './types';

// We use the ReturnType of deriveFromSsrInitialState, which in turn uses the ReturnType of deriveFromClientSideState,
// to ensure these stay in sync without having to manually type them out.
export type DeriveStateReturnType = ReturnType<typeof deriveFromSsrInitialState>;

/**
 * Derives authentication state based on the current rendering context (SSR or client-side).
 */
export const deriveState = (
  clerkOperational: boolean,
  state: Resources,
  initialState: InitialState | undefined,
): DeriveStateReturnType => {
  if (!clerkOperational && initialState) {
    return deriveFromSsrInitialState(initialState);
  }
  return deriveFromClientSideState(state);
};

// We use the ReturnType of deriveFromClientSideState to ensure these stay in sync
export const deriveFromSsrInitialState = (initialState: InitialState): ReturnType<typeof deriveFromClientSideState> => {
  const userId = initialState.userId;
  const user = initialState.user as UserResource;
  const sessionId = initialState.sessionId;
  const sessionStatus = initialState.sessionStatus;
  const sessionClaims = initialState.sessionClaims;
  const session = initialState.session as SignedInSessionResource;
  const organization = initialState.organization as OrganizationResource;
  const orgId = initialState.orgId;
  const orgRole = initialState.orgRole as OrganizationCustomRoleKey;
  const orgPermissions = initialState.orgPermissions as OrganizationCustomPermissionKey[];
  const orgSlug = initialState.orgSlug;
  const actor = initialState.actor;
  const factorVerificationAge = initialState.factorVerificationAge;

  return {
    userId,
    user,
    sessionId,
    session,
    sessionStatus,
    sessionClaims,
    organization,
    orgId,
    orgRole,
    orgPermissions,
    orgSlug,
    actor,
    factorVerificationAge,
  };
};

export const deriveFromClientSideState = (state: Resources) => {
  const userId: string | null | undefined = state.user ? state.user.id : state.user;
  const user = state.user;
  const sessionId: string | null | undefined = state.session ? state.session.id : state.session;
  const session = state.session;
  const sessionStatus = state.session?.status;
  const sessionClaims: JwtPayload | null | undefined = state.session
    ? state.session.lastActiveToken?.jwt?.claims
    : null;
  const factorVerificationAge: [number, number] | null = state.session ? state.session.factorVerificationAge : null;
  const actor = session?.actor;
  const organization = state.organization;
  const orgId: string | null | undefined = state.organization ? state.organization.id : state.organization;
  const orgSlug = organization?.slug;
  const membership = organization
    ? user?.organizationMemberships?.find(om => om.organization.id === orgId)
    : organization;
  const orgPermissions = membership ? membership.permissions : membership;
  const orgRole = membership ? membership.role : membership;

  return {
    userId,
    user,
    sessionId,
    session,
    sessionStatus,
    sessionClaims,
    organization,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    actor,
    factorVerificationAge,
  };
};
