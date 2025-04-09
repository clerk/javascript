import type { APIKeyJSON } from './JSON';

export class APIKey {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly subject: string,
    readonly name: string,
    readonly claims: Record<string, string>,
    readonly revoked: boolean,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdBy: string | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly creationReason?: string | null,
  ) {}

  static fromJSON(data: APIKeyJSON) {
    return new APIKey(
      data.id,
      data.type,
      data.subject,
      data.name,
      data.claims,
      data.revoked,
      data.expired,
      data.expiration,
      data.created_by,
      data.created_at,
      data.updated_at,
      data.creation_reason,
    );
  }
}
