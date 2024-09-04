import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';

export interface Jwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: Uint8Array;
  raw: {
    header: string;
    payload: string;
    signature: string;
    text: string;
  };
}

// standard header claims https://www.rfc-editor.org/rfc/rfc7515.html#section-4.1
export interface JwtHeader {
  alg: string;
  typ?: string;
  cty?: string;
  crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>>;
  kid: string;
  jku?: string;
  x5u?: string | string[];
  'x5t#S256'?: string;
  x5t?: string;
  x5c?: string | string[];
}

declare global {
  /**
   * If you want to provide custom types for the getAuth().sessionClaims object,
   * simply redeclare this interface in the global namespace and provide your own custom keys.
   */
  interface CustomJwtSessionClaims {
    [k: string]: unknown;
  }
}

export interface JwtPayload extends CustomJwtSessionClaims {
  /**
   * Encoded token supporting the `getRawString` method.
   */
  __raw: string;
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
   * JWT Actor - [RFC8693](https://www.rfc-editor.org/rfc/rfc8693.html#name-act-actor-claim).
   */
  act?: ActClaim;

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
  org_role?: OrganizationCustomRoleKey;

  /**
   * Active organization role
   */
  org_permissions?: OrganizationCustomPermissionKey[];

  /**
   * Factor Verification Age
   * Each item represents the minutes that have passed since the last time a first or second factor were verified.
   * [fistFactorAge, secondFactorAge]
   * @experimental This API is experimental and may change at any moment.
   */
  fva: [number | null, number | null];

  /**
   * Any other JWT Claim Set member.
   */
  [propName: string]: unknown;
}

/**
 * JWT Actor - [RFC8693](https://www.rfc-editor.org/rfc/rfc8693.html#name-act-actor-claim).
 */
export interface ActClaim {
  sub: string;

  [x: string]: unknown;
}
