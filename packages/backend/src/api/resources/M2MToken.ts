import type { M2MTokenJSON } from './JSON';

// Minimal JWT claims present in M2M tokens. M2M tokens are not session JWTs
// and do not carry session-specific claims like `sid` or `__raw`.
type M2MJwtPayload = {
  sub: string;
  exp: number;
  iat: number;
  jti?: string;
  aud?: string[];
  scopes?: string;
  [key: string]: unknown;
};

// Structural claims that Clerk's machine-token service always adds when it mints
// an M2M JWT. These are mapped onto dedicated `M2MToken` fields, so they are
// stripped from `claims`. Everything else is a user-supplied custom claim and is
// surfaced through `claims`, including `aud` and `scopes`, which the backend
// treats as custom claims (they are neither reserved nor auto-added).
const M2M_RESERVED_JWT_CLAIMS = new Set(['iss', 'sub', 'exp', 'nbf', 'iat', 'jti']);

/**
 * Reconstructs the custom claims that were attached at token creation by
 * stripping the structural claims (see `M2M_RESERVED_JWT_CLAIMS`) from the
 * verified payload. Returns `null` when no custom claims are present, matching
 * the opaque-token path where a token created without claims verifies back to
 * `claims: null`.
 */
function extractCustomClaims(payload: M2MJwtPayload): Record<string, any> | null {
  const claims: Record<string, any> = {};
  for (const key of Object.keys(payload)) {
    if (!M2M_RESERVED_JWT_CLAIMS.has(key)) {
      claims[key] = payload[key];
    }
  }
  return Object.keys(claims).length > 0 ? claims : null;
}

/**
 * The Backend `M2MToken` object holds information about a machine-to-machine token.
 */
export class M2MToken {
  constructor(
    readonly id: string,
    readonly subject: string,
    readonly scopes: string[],
    readonly claims: Record<string, any> | null,
    readonly revoked: boolean,
    readonly revocationReason: string | null,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly token?: string,
  ) {}

  static fromJSON(data: M2MTokenJSON): M2MToken {
    return new M2MToken(
      data.id,
      data.subject,
      data.scopes,
      data.claims,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
      data.token,
    );
  }

  static fromJwtPayload(payload: M2MJwtPayload, clockSkewInMs = 5000): M2MToken {
    return new M2MToken(
      payload.jti ?? '', // jti should always be present in Clerk-issued M2M JWTs
      payload.sub,
      payload.scopes?.split(' ') ?? payload.aud ?? [],
      extractCustomClaims(payload),
      false,
      null,
      payload.exp * 1000 <= Date.now() - clockSkewInMs,
      payload.exp * 1000, // milliseconds — expiration, converted from JWT exp claim
      payload.iat * 1000, // milliseconds — createdAt, converted from JWT iat claim
      payload.iat * 1000, // milliseconds — updatedAt, no JWT equivalent; defaults to iat
    );
  }
}
