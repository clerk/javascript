import type { JwtPayload } from '@clerk/types';

import type { IdPOAuthAccessTokenJSON } from './JSON';

type OAuthJwtPayload = JwtPayload & {
  jti?: string;
  client_id?: string;
  scope?: string;
  scp?: string[];
};

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

  /**
   * Creates an IdPOAuthAccessToken from a JWT payload.
   * Maps standard JWT claims and OAuth-specific fields to token properties.
   */
  static fromJwtPayload(payload: JwtPayload, clockSkewInMs = 5000): IdPOAuthAccessToken {
    const oauthPayload = payload as OAuthJwtPayload;

    // Map JWT claims to IdPOAuthAccessToken fields
    return new IdPOAuthAccessToken(
      oauthPayload.jti ?? '',
      oauthPayload.client_id ?? '',
      'oauth_access_token',
      payload.sub,
      oauthPayload.scp ?? oauthPayload.scope?.split(' ') ?? [],
      false,
      null,
      payload.exp * 1000 <= Date.now() - clockSkewInMs,
      payload.exp,
      payload.iat ?? 0,
      payload.iat ?? 0,
    );
  }
}
