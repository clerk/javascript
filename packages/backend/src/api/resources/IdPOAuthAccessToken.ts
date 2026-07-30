import type { CustomPermissionKey, JwtPayload } from '@clerk/shared/types';

import type { IdPOAuthAccessTokenJSON } from './JSON';

type OAuthJwtPayload = JwtPayload & {
  jti?: string;
  client_id?: string;
  scope?: unknown;
  scp?: unknown;
  permissions?: unknown;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string') ? value : [];

const isCustomPermissionKey = (value: unknown): value is CustomPermissionKey => typeof value === 'string';

const asCustomPermissionKeys = (value: unknown): CustomPermissionKey[] =>
  Array.isArray(value) && value.every(isCustomPermissionKey) ? value : [];

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
    /** The Unix timestamp (in milliseconds) when the access token expires. */
    readonly expiration: number | null,
    /** The Unix timestamp (in milliseconds) when the access token was created. */
    readonly createdAt: number,
    /** The Unix timestamp (in milliseconds) when the access token was last updated. */
    readonly updatedAt: number,
    readonly permissions: CustomPermissionKey[] = [],
  ) {}

  static fromJSON(data: IdPOAuthAccessTokenJSON) {
    return new IdPOAuthAccessToken(
      data.id,
      data.client_id,
      data.type,
      data.subject,
      asStringArray(data.scopes),
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
      asCustomPermissionKeys(data.permissions),
    );
  }

  /**
   * Creates an IdPOAuthAccessToken from a JWT payload.
   * Maps standard JWT claims and OAuth-specific fields to token properties.
   */
  static fromJwtPayload(payload: JwtPayload, clockSkewInMs = 5000): IdPOAuthAccessToken {
    const oauthPayload = payload as OAuthJwtPayload;
    const scopes =
      oauthPayload.scp === undefined
        ? typeof oauthPayload.scope === 'string'
          ? oauthPayload.scope.split(' ').filter(Boolean)
          : []
        : asStringArray(oauthPayload.scp);

    // Map JWT claims to IdPOAuthAccessToken fields
    return new IdPOAuthAccessToken(
      oauthPayload.jti ?? '',
      oauthPayload.client_id ?? '',
      'oauth_token',
      payload.sub,
      scopes,
      false,
      null,
      payload.exp * 1000 <= Date.now() - clockSkewInMs,
      payload.exp * 1000, // milliseconds: expiration, converted from JWT exp claim
      payload.iat * 1000, // milliseconds: createdAt, converted from JWT iat claim
      payload.iat * 1000, // milliseconds: updatedAt, no JWT equivalent, defaults to iat
      asCustomPermissionKeys(oauthPayload.permissions),
    );
  }
}
