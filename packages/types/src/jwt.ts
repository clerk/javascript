import { MembershipRole } from './organizationMembership';

export interface JWT {
  encoded: { header: string; payload: string; signature: string };
  header: JWTHeader;
  claims: JWTClaims;
}

// standard names https://www.rfc-editor.org/rfc/rfc7515.html#section-4.1
export interface JWTHeader {
  alg: string | Algorithm;
  typ?: string;
  cty?: string;
  crit?: Array<string | Exclude<keyof JWTHeader, 'crit'>>;
  kid?: string;
  jku?: string;
  x5u?: string | string[];
  'x5t#S256'?: string;
  x5t?: string;
  x5c?: string | string[];
}

export interface JWTClaims extends ClerkJWTClaims {
  /**
   * Encoded token supporting the `getRawString` method.
   */
  __raw: string;
}

/* Clerk-issued JWT payload */
export interface ClerkJWTClaims {
  /**
   * JWT Issuer - [RFC7519#section-4.1.1](https://tools.ietf.org/html/rfc7519#section-4.1.1).
   */
  iss: string;

  /**
   * JWT Subject - [RFC7519#section-4.1.2](https://tools.ietf.org/html/rfc7519#section-4.1.2).
   */
  sub: string;

  /**
   * Session ID
   */
  sid: string;

  /**
   * JWT Not Before - [RFC7519#section-4.1.5](https://tools.ietf.org/html/rfc7519#section-4.1.5).
   */
  nbf: number;

  /**
   * JWT Expiration Time - [RFC7519#section-4.1.4](https://tools.ietf.org/html/rfc7519#section-4.1.4).
   */
  exp: number;

  /**
   * JWT Issued At - [RFC7519#section-4.1.6](https://tools.ietf.org/html/rfc7519#section-4.1.6).
   */
  iat: number;

  /**
   * JWT Authorized party - [RFC7800#section-3](https://tools.ietf.org/html/rfc7800#section-3).
   */
  azp?: string;

  /**
   * @deprecated - Add orgs to your session token using the "user.organizations" shortcode in JWT Templates instead
   */
  orgs?: Record<string, MembershipRole>;

  /**
   * Active organization id.
   */
  org_id?: string;

  /**
   * Active organization slug.
   */
  org_slug?: string;

  /**
   * Active organization role
   */
  org_role?: MembershipRole;

  /**
   * Any other JWT Claim Set member.
   */
  [propName: string]: unknown;
}

export type OrganizationsJWTClaim = Record<string, MembershipRole>;
