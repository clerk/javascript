import type { APIKeyJSON } from './JSON';

export class APIKey {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly name: string,
    readonly subject: string,
    readonly claims: Record<string, string> | null,
    readonly createdBy: string | null,
    readonly creationReason: string | null,
    readonly secondsUntilExpiration: number | null,
    readonly createdAt: number,
    readonly expiresAt: number | null,
  ) {}

  static fromJSON(data: APIKeyJSON) {
    return new APIKey(
      data.id,
      data.type,
      data.name,
      data.subject,
      data.claims,
      data.created_by,
      data.creation_reason,
      data.seconds_until_expiration,
      data.created_at,
      data.expires_at,
    );
  }
}
