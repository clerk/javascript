import type { MachineTokenJSON } from './JSON';

export class MachineToken {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly subject: string,
    readonly claims: Record<string, string> | null,
    readonly revoked: boolean,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdBy: string | null,
    readonly creationReason: string | null,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: MachineTokenJSON) {
    return new MachineToken(
      data.id,
      data.subject,
      data.name,
      data.claims,
      data.revoked,
      data.expired,
      data.expiration,
      data.created_by,
      data.creation_reason,
      data.created_at,
      data.updated_at,
    );
  }
}
