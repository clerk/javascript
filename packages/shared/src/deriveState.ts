import type {
  ActiveSessionResource,
  InitialState,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  OrganizationResource,
  Resources,
  UserResource,
} from '@clerk/types';

/**
 * Derives authentication state based on the current rendering context (SSR or client-side).
 */
export const deriveState = (clerkLoaded: boolean, state: Resources, initialState: InitialState | undefined) => {
  if (!clerkLoaded && initialState) {
    return deriveFromSsrInitialState(initialState);
  }
  return deriveFromClientSideState(state);
};

const deriveFromSsrInitialState = (initialState: InitialState) => {
  const userId = initialState.userId;
  const user = initialState.user as UserResource;
  const sessionId = initialState.sessionId;
  const session = initialState.session as ActiveSessionResource;
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
    organization,
    orgId,
    orgRole,
    orgPermissions,
    orgSlug,
    actor,
    factorVerificationAge,
  };
};

const deriveFromClientSideState = (state: Resources) => {
  const userId: string | null | undefined = state.user ? state.user.id : state.user;
  const user = state.user;
  const sessionId: string | null | undefined = state.session ? state.session.id : state.session;
  const session = state.session;
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
    organization,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    actor,
    factorVerificationAge,
  };
};
