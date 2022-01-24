import type { Nullable } from '../../util/nullable';
import associationDefaults from '../utils/Associations';
import { Association } from './Enums';
import { IdentificationLink } from './IdentificationLink';
import type { EmailAddressJSON } from './JSON';
import type { EmailAddressProps } from './Props';
import { Verification } from './Verification';

interface EmailAddressAssociations {
  verification: Nullable<Verification>;
  linkedTo: IdentificationLink[];
}

interface EmailAddressPayload
  extends EmailAddressProps,
    EmailAddressAssociations {}

export interface EmailAddress extends EmailAddressPayload {}

export class EmailAddress {
  static attributes = ['id', 'emailAddress'];

  static associations = {
    verification: Association.HasOne,
    linkedTo: Association.HasMany,
  };

  static defaults = associationDefaults(EmailAddress.associations);

  constructor(data: Partial<EmailAddressPayload> = {}) {
    Object.assign(this, EmailAddress.defaults, data);
  }

  static fromJSON(data: EmailAddressJSON): EmailAddress {
    return new EmailAddress({
      id: data.id,
      emailAddress: data.email_address,
      verification: Verification.fromJSON(data.verification),
      linkedTo: (data.linked_to || []).map((link) => {
        return IdentificationLink.fromJSON(link);
      }),
    });
  }
}
