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
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface JWT {
  encoded: { header: string; payload: string; signature: string };
  header: {};
  claims: JWTClaims;
}
