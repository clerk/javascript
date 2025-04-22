import type { IdPOAuthAccessTokenJSON } from './JSON';

export class IdPOAuthAccessToken {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly name: string,
    readonly subject: string,
    readonly claims: Record<string, string> | null,
    readonly createdAt: number,
    readonly expiresAt: number,
  ) {}

  static fromJSON(data: IdPOAuthAccessTokenJSON) {
    return new IdPOAuthAccessToken(
      data.id,
      data.type,
      data.name,
      data.subject,
      data.claims,
      data.created_at,
      data.expires_at,
    );
  }
}
