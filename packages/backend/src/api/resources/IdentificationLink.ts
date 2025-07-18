import type { IdentificationLinkJSON } from './JSON';

/**
 * Contains information about any identifications that might be linked to the email address.
 */
export class IdentificationLink {
  constructor(
    /**
     * The unique identifier for the identification link.
     */
    readonly id: string,
    /**
     * The type of the identification link, e.g., `"email_address"`, `"phone_number"`, etc.
     */
    readonly type: string,
  ) {}

  static fromJSON(data: IdentificationLinkJSON): IdentificationLink {
    return new IdentificationLink(data.id, data.type);
  }
}
