import type { APIKeyJSON } from './JSON';

export class APIKey {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly subject: string,
    readonly name: string,
    readonly claims: Record<string, string> | null,
    readonly createdBy: string | null,
    readonly createdAt: number,
    readonly expiresAt: number | null,
    readonly creationReason?: string | null,
  ) {}

  static fromJSON(data: APIKeyJSON) {
    return new APIKey(
      data.id,
      data.type,
      data.subject,
      data.name,
      data.claims,
      data.created_by,
      data.created_at,
      data.expires_at,
      data.creation_reason,
    );
  }
}
