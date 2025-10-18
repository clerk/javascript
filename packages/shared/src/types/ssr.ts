import type { ActClaim, JwtPayload, SessionStatusClaim } from './jwtv2';
import type { OrganizationResource } from './organization';
import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { SessionResource } from './session';
import type { UserResource } from './user';
import type { Serializable } from './utils';

/**
 * Options for retrieving a session token.
 */
export type ServerGetTokenOptions = {
  /**
   * The name of a JWT template configured in the Clerk Dashboard.
   * If provided, a JWT will be generated using the specified template.
   * If not provided, the raw session token will be returned.
   */
  template?: string;
  /**
   * The expiration time for the token in seconds.
   * If provided, the token will expire after the specified number of seconds.
   * Must be a positive integer.
   */
  expiresInSeconds?: number;
};

/**
 * A function that retrieves a session token or JWT template.
 *
 * @param options - Configuration options for token retrieval
 * @returns A promise that resolves to the token string, or null if no session exists
 */
export type ServerGetToken = (options?: ServerGetTokenOptions) => Promise<string | null>;

export type InitialState = Serializable<{
  sessionClaims: JwtPayload;
  sessionId: string | undefined;
  sessionStatus: SessionStatusClaim;
  session: SessionResource | undefined;
  actor: ActClaim | undefined;
  userId: string | undefined;
  user: UserResource | undefined;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  organization: OrganizationResource | undefined;
  factorVerificationAge: [number, number];
}>;
