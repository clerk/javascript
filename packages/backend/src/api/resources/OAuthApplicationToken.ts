import type { OAuthApplicationTokenJSON } from './JSON';

export class OAuthApplicationToken {
  constructor(
    readonly id: string,
    readonly subject: string,
    readonly claims: Record<string, string>,
    readonly revoked: boolean,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: OAuthApplicationTokenJSON) {
    return new OAuthApplicationToken(
      data.id,
      data.subject,
      data.claims,
      data.revoked,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
    );
  }
}
