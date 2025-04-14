import type { OAuthApplicationTokenJSON } from './JSON';

export class OAuthApplicationToken {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly name: string,
    readonly subject: string,
    readonly claims: Record<string, string> | null,
    readonly createdAt: number,
    readonly expiresAt: number,
  ) {}

  static fromJSON(data: OAuthApplicationTokenJSON) {
    return new OAuthApplicationToken(
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
