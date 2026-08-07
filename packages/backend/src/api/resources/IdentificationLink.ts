import type { IdentificationLinkJSON } from './JSON';

/**
 * The `IdentificationLink` object contains information about any identifications that might be linked to the identifier (email address, phone number, etc.).
 */
export class IdentificationLink {
  constructor(
    /** The unique identifier for the identification link. */
    readonly id: string,
    /** The type of the identification link, e.g., `"email_address"`, `"phone_number"`, etc. */
    readonly type: string,
  ) {}

  static fromJSON(data: IdentificationLinkJSON): IdentificationLink {
    return new IdentificationLink(data.id, data.type);
  }
}
