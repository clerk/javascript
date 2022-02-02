export interface JWTPayload {
  /**
   * JWT Issuer - [RFC7519#section-4.1.1](https://tools.ietf.org/html/rfc7519#section-4.1.1).
   */
  iss?: string;

  /**
   * JWT Subject - [RFC7519#section-4.1.2](https://tools.ietf.org/html/rfc7519#section-4.1.2).
   */
  sub?: string;

  /**
   * JWT Audience [RFC7519#section-4.1.3](https://tools.ietf.org/html/rfc7519#section-4.1.3).
   */
  aud?: string | string[];

  /**
   * JWT ID - [RFC7519#section-4.1.7](https://tools.ietf.org/html/rfc7519#section-4.1.7).
   */
  jti?: string;

  /**
   * JWT Not Before - [RFC7519#section-4.1.5](https://tools.ietf.org/html/rfc7519#section-4.1.5).
   */
  nbf?: number;

  /**
   * JWT Expiration Time - [RFC7519#section-4.1.4](https://tools.ietf.org/html/rfc7519#section-4.1.4).
   */
  exp?: number;

  /**
   * JWT Issued At - [RFC7519#section-4.1.6](https://tools.ietf.org/html/rfc7519#section-4.1.6).
   */
  iat?: number;

  /**
   * JWT Authorized party - [RFC7800#section-3](https://tools.ietf.org/html/rfc7800#section-3).
   */
  azp?: string;

  /**
   * Any other JWT Claim Set member.
   */
  [propName: string]: unknown;
}

export interface JWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
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
