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

  /**
   * Creates an M2MToken from a JWT payload.
   * Maps standard JWT claims to token properties.
   */
  static fromJwtPayload(payload: M2MJwtPayload, clockSkewInMs = 5000): M2MToken {
    return new M2MToken(
      payload.jti ?? '',
      payload.sub,
      payload.scopes?.split(' ') ?? payload.aud ?? [],
      null,
      false,
      null,
      payload.exp * 1000 <= Date.now() - clockSkewInMs,
      payload.exp, // seconds (raw JWT exp claim)
      payload.iat, // seconds (raw JWT iat claim)
      payload.iat, // seconds (raw JWT iat claim)
    );
  }
}
