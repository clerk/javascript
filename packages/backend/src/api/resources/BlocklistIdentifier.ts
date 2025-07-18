import type { BlocklistIdentifierType } from './Enums';
import type { BlocklistIdentifierJSON } from './JSON';

export class BlocklistIdentifier {
  constructor(
    readonly id: string,
    readonly identifier: string,
    readonly identifierType: BlocklistIdentifierType,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly instanceId?: string,
  ) {}

  static fromJSON(data: BlocklistIdentifierJSON): BlocklistIdentifier {
    return new BlocklistIdentifier(
      data.id,
      data.identifier,
      data.identifier_type,
      data.created_at,
      data.updated_at,
      data.instance_id,
    );
  }
}
