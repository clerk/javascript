import type { AllowlistIdentifierJSON } from './JSON';

export class AllowlistIdentifier {
  constructor(
    readonly id: string,
    readonly identifier: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly invitationId?: string,
  ) {}

  static fromJSON(data: AllowlistIdentifierJSON): AllowlistIdentifier {
    return new AllowlistIdentifier(data.id, data.identifier, data.created_at, data.updated_at, data.invitation_id);
  }
}
