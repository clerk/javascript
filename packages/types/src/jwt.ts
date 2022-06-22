import { MembershipRole } from './organizationMembership';

export interface JWTClaims {
  __raw: string;
  sub: string;
  iss: string;
  exp: number;
  sid?: string;
  aud?: string;
  iat?: number;
  nbf?: number;
  name?: string;
  orgs?: OrganizationsJWTClaim;
  /**
   * Active organization id.
   */
  org_id?: string;

  /**
   * Active organization role
   */
  org_role?: MembershipRole;
  [key: string]: unknown;
}

export type OrganizationsJWTClaim = Record<string, MembershipRole>;
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface JWT {
  encoded: { header: string; payload: string; signature: string };
  header: {};
  claims: JWTClaims;
}
