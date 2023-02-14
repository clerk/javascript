import type { ActJWTClaim, ClerkJWTClaims } from './jwt';
import type { ActClaim, JwtPayload } from './jwtv2';
import type { OrganizationResource } from './organization';
import type { MembershipRole } from './organizationMembership';
import type { SessionResource } from './session';
import type { UserResource } from './user';
import type { Serializable } from './utils';

export type ServerGetTokenOptions = { template?: string };
export type ServerGetToken = (options?: ServerGetTokenOptions) => Promise<string | null>;

/**
 * @deprecated
 */
export type ServerSideAuth = {
  sessionId: string | null;
  userId: string | null;
  actor: ActJWTClaim | null;
  getToken: ServerGetToken;
  claims: ClerkJWTClaims | null;
};

export type InitialState = Serializable<{
  sessionClaims: JwtPayload;
  sessionId: string | undefined;
  session: SessionResource | undefined;
  actor: ActClaim | undefined;
  userId: string | undefined;
  user: UserResource | undefined;
  orgId: string | undefined;
  orgRole: MembershipRole | undefined;
  orgSlug: string | undefined;
  organization: OrganizationResource | undefined;
}>;
