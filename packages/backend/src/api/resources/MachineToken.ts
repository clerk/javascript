import type { MachineTokenJSON } from './JSON';

export class MachineToken {
  constructor(
    readonly id: string,
    readonly secret: string,
    readonly name: string,
    readonly subject: string,
    readonly revoked: boolean,
    readonly expiration: number,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly expired: boolean,
    readonly creationReason: string,
    readonly createdBy: string,
  ) {}

  static fromJSON(data: MachineTokenJSON): MachineToken {
    return new MachineToken(
      data.id,
      data.secret,
      data.name,
      data.subject,
      data.revoked,
      data.expiration,
      data.created_at,
      data.updated_at,
      data.expired,
      data.creation_reason,
      data.created_by,
    );
  }
}
