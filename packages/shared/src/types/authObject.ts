import type { ActClaim, JwtPayload, SessionStatusClaim } from './jwtv2';
import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';

/**
 * @internal
 */
export type SharedSignedInAuthObjectProperties = {
  /**
   * The current user's [session claims](https://clerk.com/docs/guides/sessions/session-tokens).
   */
  sessionClaims: JwtPayload;
  /**
   * The ID of the current session.
   */
  sessionId: string;
  /**
   * The current state of the session.
   */
  sessionStatus: SessionStatusClaim | null;
  /**
   * Holds identifier for the user that is impersonating the current user. Read more about [impersonation](https://clerk.com/docs/guides/users/impersonation).
   */
  actor: ActClaim | undefined;
  /**
   * The ID of the current user.
   */
  userId: string;
  /**
   * The ID of the user's active organization.
   */
  orgId: string | undefined;
  /**
   * The current user's role in their active organization.
   */
  orgRole: OrganizationCustomRoleKey | undefined;
  /**
   * The URL-friendly identifier of the user's active organization.
   */
  orgSlug: string | undefined;
  /**
   * The current user's active organization permissions.
   */
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  /**
   * An array where each item represents the number of minutes since the last verification of a first or second factor: `[firstFactorAge, secondFactorAge]`.
   */
  factorVerificationAge: [firstFactorAge: number, secondFactorAge: number] | null;
};
