import { IdentificationLink } from './IdentificationLink';
import type { EmailAddressJSON } from './JSON';
import { Verification } from './Verification';

export class EmailAddress {
  constructor(
    readonly id: string,
    readonly emailAddress: string,
    readonly verification: Verification | null,
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
