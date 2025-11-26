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
}
