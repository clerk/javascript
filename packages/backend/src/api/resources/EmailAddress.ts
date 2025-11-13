import { IdentificationLink } from './IdentificationLink';
import type { EmailAddressJSON } from './JSON';
import { Verification } from './Verification';

/**
 * The Backend `EmailAddress` object is a model around an email address.
 *
 * Email addresses must be **verified** to ensure that they are assigned to their rightful owners. The `EmailAddress` object holds all necessary state around the verification process.
 *
 * For implementation examples for adding and verifying email addresses, see the [email link custom flow](https://clerk.com/docs/guides/development/custom-flows/authentication/email-links) and [email code custom flow](https://clerk.com/docs/guides/development/custom-flows/account-updates/add-email) guides.
 */
export class EmailAddress {
  constructor(
    /**
     * The unique identifier for the email address.
     */
    readonly id: string,
    /**
     * The value of the email address.
     */
    readonly emailAddress: string,
    /**
     * An object holding information on the verification of the email address.
     */
    readonly verification: Verification | null,
    /**
     * An array of objects containing information about any identifications that might be linked to the email address.
     */
    readonly linkedTo: IdentificationLink[],
  ) {}

  static fromJSON(data: EmailAddressJSON): EmailAddress {
    return new EmailAddress(
      data.id,
      data.email_address,
      data.verification && Verification.fromJSON(data.verification),
      data.linked_to.map(link => IdentificationLink.fromJSON(link)),
    );
  }
}
