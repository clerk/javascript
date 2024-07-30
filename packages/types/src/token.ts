import type { ActClaim, JwtPayload } from 'jwtv2';
import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from 'organizationMembership';
import type { CheckAuthorizationWithCustomPermissions } from 'session';
import type { ServerGetToken } from 'ssr';

import type { JWT } from './jwt';
import type { ClerkResource } from './resource';

export interface TokenResource extends ClerkResource {
  jwt?: JWT;
  getRawString: () => string;
}
/**
 * @internal
 */
export type AuthObjectDebugData = Record<string, any>;
/**
 * @internal
 */
export type AuthObjectDebug = () => AuthObjectDebugData;

/**
 * @internal
 */
export type SignedInAuthObject = {
  sessionClaims: JwtPayload;
  sessionId: string;
  actor: ActClaim | undefined;
  userId: string;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
  debug: AuthObjectDebug;
};

/**
 * @internal
 */
export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
  actor: null;
  userId: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
  debug: AuthObjectDebug;
};

export type AuthObject = SignedInAuthObject | SignedOutAuthObject;
