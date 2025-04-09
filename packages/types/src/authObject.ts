import type { ActClaim, JwtPayload, SessionStatusClaim } from './jwtv2';
import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';

/**
 * @internal
 */
export type SharedSignedInAuthObjectProperties = {
  sessionClaims: JwtPayload;
  sessionId: string;
  sessionStatus: SessionStatusClaim | null;
  actor: ActClaim | undefined;
  userId: string;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  /**
   * Factor Verification Age
   * Each item represents the minutes that have passed since the last time a first or second factor were verified.
   * [fistFactorAge, secondFactorAge]
   */
  factorVerificationAge: [firstFactorAge: number, secondFactorAge: number] | null;
};
