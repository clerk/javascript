import type { OauthApplicationTokenJSON } from './JSON';

export class OauthApplicationToken {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly name: string,
    readonly subject: string,
    readonly claims: Record<string, string> | null,
    readonly createdAt: number,
    readonly expiresAt: number,
  ) {}

  static fromJSON(data: OauthApplicationTokenJSON) {
    return new OauthApplicationToken(
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
