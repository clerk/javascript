import type { InvitationJSON } from './JSON';

export class Invitation {
  constructor(
    readonly id: string,
    readonly emailAddress: string,
    readonly publicMetadata: Record<string, unknown> | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly revoked?: boolean,
  ) {}

  static fromJSON(data: InvitationJSON): Invitation {
    return new Invitation(
      data.id,
      data.email_address,
      data.public_metadata,
      data.created_at,
      data.updated_at,
      data.revoked,
    );
  }
}
