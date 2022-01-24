import type { Nullable } from '../../util/nullable';
import associationDefaults from '../utils/Associations';
import { Association } from './Enums';
import { IdentificationLink } from './IdentificationLink';
import type { IdentificationLinkJSON, PhoneNumberJSON } from './JSON';
import type { PhoneNumberProps } from './Props';
import { Verification } from './Verification';

interface PhoneNumberAssociations {
  verification: Nullable<Verification>;
  linkedTo: IdentificationLink[];
}

interface PhoneNumberPayload
  extends PhoneNumberProps,
    PhoneNumberAssociations {}

export interface PhoneNumber extends PhoneNumberPayload {}

export class PhoneNumber {
  static attributes = ['id', 'phoneNumber', 'reservedForSecondFactor'];

  static associations = {
    verification: Association.HasOne,
    linkedTo: Association.HasMany,
  };

  static defaults = associationDefaults(PhoneNumber.associations);

  constructor(data: Partial<PhoneNumberPayload> = {}) {
    Object.assign(this, PhoneNumber.defaults, data);
  }

  static fromJSON(data: PhoneNumberJSON): PhoneNumber {
    return new PhoneNumber({
      id: data.id,
      phoneNumber: data.phone_number,
      reservedForSecondFactor: data.reserved_for_second_factor,
      verification: Verification.fromJSON(data.verification),
      linkedTo: (data.linked_to || []).map((link: IdentificationLinkJSON) => {
        return IdentificationLink.fromJSON(link);
      }),
    });
  }
}
