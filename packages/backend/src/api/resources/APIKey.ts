import type { APIKeyJSON } from './JSON';

export class APIKey {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly name: string,
    readonly subject: string,
    readonly scopes: string[],
    readonly claims: Record<string, string> | null,
    readonly revoked: boolean,
    readonly revocationReason: string | null,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdBy: string | null,
    readonly creationReason: string | null,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: APIKeyJSON) {
    return new APIKey(
      data.id,
      data.type,
      data.name,
      data.subject,
      data.scopes,
      data.claims,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_by,
      data.creation_reason,
      data.created_at,
      data.updated_at,
    );
  }
}
