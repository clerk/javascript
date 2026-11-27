import type { JwtPayload } from '@clerk/shared/types';

import type { IdPOAuthAccessTokenActorJSON, IdPOAuthAccessTokenGrantedOrgJSON, IdPOAuthAccessTokenJSON } from './JSON';

type OAuthJwtPayload = JwtPayload & {
  aud?: string | string[];
  jti?: string;
  client_id?: string;
  scope?: string;
  scp?: string[];
  act?: unknown;
  org_id?: unknown;
  granted_orgs?: unknown;
};

function toActor(value: unknown, nestedLevels: number): IdPOAuthAccessTokenActorJSON | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const { iss, sub, act } = value as Record<string, unknown>;
  if (typeof sub !== 'string') {
    return undefined;
  }
  const nested = nestedLevels > 0 ? toActor(act, nestedLevels - 1) : undefined;
  return {
    ...(typeof iss === 'string' ? { iss } : {}),
    sub,
    ...(nested ? { act: nested } : {}),
  };
}

function toOrgId(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function toGrantedOrgs(value: unknown): IdPOAuthAccessTokenGrantedOrgJSON[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const grantedOrgs: IdPOAuthAccessTokenGrantedOrgJSON[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) {
      return undefined;
    }
    const { id, name } = entry as Record<string, unknown>;
    if (typeof id !== 'string' || id === '' || typeof name !== 'string') {
      return undefined;
    }
    grantedOrgs.push({ id, name });
  }
  return grantedOrgs.length > 0 ? grantedOrgs : undefined;
}

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
    /** The Unix timestamp (in seconds) when the access token expires. */
    readonly expiration: number | null,
    /** The Unix timestamp (in seconds) when the access token was created. */
    readonly createdAt: number,
    /** The Unix timestamp (in seconds) when the access token was last updated. */
    readonly updatedAt: number,
    /** The intended audience for the access token. */
    readonly aud?: string[],
    /** The actor chain of a token issued by an OAuth 2.0 Token Exchange (RFC 8693 section 4.1). */
    readonly act?: IdPOAuthAccessTokenActorJSON,
    /** The default organization of the grant. */
    readonly orgId?: string,
    /** The organizations the user granted in one consent, default first. Present only when two or more were granted. */
    readonly grantedOrgs?: IdPOAuthAccessTokenGrantedOrgJSON[],
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
      data.aud,
      toActor(data.act, 1),
      toOrgId(data.org_id),
      toGrantedOrgs(data.granted_orgs),
    );
  }

  /**
   * Creates an IdPOAuthAccessToken from a JWT payload.
   * Maps standard JWT claims and OAuth-specific fields to token properties.
   * The raw JWT `aud` claim can be a string, string[], or undefined. It is normalized to string[].
   */
  static fromJwtPayload(payload: JwtPayload, clockSkewInMs = 5000): IdPOAuthAccessToken {
    const oauthPayload = payload as OAuthJwtPayload;

    // Map JWT claims to IdPOAuthAccessToken fields
    return new IdPOAuthAccessToken(
      oauthPayload.jti ?? '',
      oauthPayload.client_id ?? '',
      'oauth_token',
      payload.sub,
      oauthPayload.scp ?? oauthPayload.scope?.split(' ') ?? [],
      false,
      null,
      payload.exp * 1000 <= Date.now() - clockSkewInMs,
      payload.exp * 1000, // milliseconds: expiration, converted from JWT exp claim
      payload.iat * 1000, // milliseconds: createdAt, converted from JWT iat claim
      payload.iat * 1000, // milliseconds: updatedAt, no JWT equivalent, defaults to iat
      oauthPayload.aud === undefined ? undefined : [oauthPayload.aud].flat(),
      toActor(oauthPayload.act, 1),
      toOrgId(oauthPayload.org_id),
      toGrantedOrgs(oauthPayload.granted_orgs),
    );
  }
}
