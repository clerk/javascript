import type { AllowlistIdentifierType } from './Enums';
import type { AllowlistIdentifierJSON } from './JSON';

export class AllowlistIdentifier {
  constructor(
    readonly id: string,
    readonly identifier: string,
    readonly identifierType: AllowlistIdentifierType,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly instanceId?: string,
    readonly invitationId?: string,
  ) {}

  static fromJSON(data: AllowlistIdentifierJSON): AllowlistIdentifier {
    return new AllowlistIdentifier(
      data.id,
      data.identifier,
      data.identifier_type,
      data.created_at,
      data.updated_at,
      data.instance_id,
      data.invitation_id,
    );
  }
}
