import type { MachineTokenJSON } from './JSON';

export class MachineToken {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly subject: string,
    readonly secondsUntilExpiration: number,
    readonly createdBy: string | null,
    readonly createdAt: number,
    readonly expiresAt: number | null,
    readonly creationReason?: string | null,
  ) {}

  static fromJSON(data: MachineTokenJSON) {
    return new MachineToken(
      data.id,
      data.subject,
      data.name,
      data.seconds_until_expiration,
      data.created_by,
      data.created_at,
      data.expires_at,
      data.creation_reason,
    );
  }
}
