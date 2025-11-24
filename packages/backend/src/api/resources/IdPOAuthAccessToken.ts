import type { JwtPayload } from '@clerk/types';

import type { IdPOAuthAccessTokenJSON } from './JSON';

export class IdPOAuthAccessToken {
  constructor(
    readonly id: string,
    readonly clientId: string,
    readonly type: string,
    readonly subject: string,
    readonly scopes: string[],
    readonly revoked: boolean,
    readonly revocationReason: string | null,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: IdPOAuthAccessTokenJSON) {
    return new IdPOAuthAccessToken(
      data.id,
      data.client_id,
      data.type,
      data.subject,
      data.scopes,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
    );
  }

  static fromJwtPayload(payload: JwtPayload, clockSkewInMs = 5000): IdPOAuthAccessToken {
    const exp = payload.exp;
    const iat = payload.iat;
    // OAuth-specific claims not in standard JwtPayload
    const oauthPayload = payload as JwtPayload & { scope?: string; scp?: string[]; client_id?: string; jti?: string };
    const scope = oauthPayload.scope;
    const scp = oauthPayload.scp;

    return new IdPOAuthAccessToken(
      oauthPayload.jti ?? '', // id
      oauthPayload.client_id ?? '', // clientId
      'oauth_access_token', // type (default)
      payload.sub, // subject
      scp ?? scope?.split(' ') ?? [], // scopes (scp array or space-delimited scope)
      false, // revoked (n/a for JWT)
      null, // revocationReason (n/a for JWT)
      exp * 1000 <= Date.now() - clockSkewInMs, // expired (computed with clock skew tolerance)
      exp, // expiration
      iat ?? 0, // createdAt
      iat ?? 0, // updatedAt (same as iat for JWT)
    );
  }
}
