import type { MachineTokenJSON } from './JSON';

export class MachineToken {
  constructor(
    readonly id: string,
    readonly subject: string,
    readonly scopes: string[],
    readonly claims: Record<string, any> | null,
    readonly revoked: boolean,
    readonly revocationReason: string | null,
    readonly expired: boolean,
    readonly expiration: number | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly secret?: string,
  ) {}

  static fromJSON(data: MachineTokenJSON): MachineToken {
    return new MachineToken(
      data.id,
      data.subject,
      data.scopes,
      data.claims,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
      data.secret,
    );
  }
}
