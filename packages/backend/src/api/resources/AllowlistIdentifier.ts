import type { AllowlistIdentifierType } from './Enums';
import type { AllowlistIdentifierJSON } from './JSON';

/**
 * The Backend `AllowlistIdentifier` object represents an identifier that has been added to the allowlist of your application. The Backend `AllowlistIdentifier` object is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Allow-list-Block-list#operation/ListAllowlistIdentifiers) and is not directly accessible from the Frontend API.
 */
export class AllowlistIdentifier {
  constructor(
    /**
     * A unique ID for the allowlist identifier.
     */
    readonly id: string,
    /**
     * The identifier that was added to the allowlist.
     */
    readonly identifier: string,
    /**
     * The type of the allowlist identifier.
     */
    readonly identifierType: AllowlistIdentifierType,
    /**
     * The date when the allowlist identifier was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the allowlist identifier was last updated.
     */
    readonly updatedAt: number,
    /**
     * The ID of the instance that this allowlist identifier belongs to.
     */
    readonly instanceId?: string,
    /**
     * The ID of the invitation sent to the identifier.
     */
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
