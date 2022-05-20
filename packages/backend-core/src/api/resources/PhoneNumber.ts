import { IdentificationLink } from './IdentificationLink';
import type { PhoneNumberJSON } from './JSON';
import { Verification } from './Verification';

export class PhoneNumber {
  constructor(
    readonly id: string,
    readonly phoneNumber: string,
    readonly reservedForSecondFactor: boolean,
    readonly defaultSecondFactor: boolean,
    readonly verification: Verification | null,
    readonly linkedTo: IdentificationLink[],
  ) {}

  static fromJSON(data: PhoneNumberJSON): PhoneNumber {
    return new PhoneNumber(
      data.id,
      data.phone_number,
      data.reserved_for_second_factor,
      data.default_second_factor,
      data.verification && Verification.fromJSON(data.verification),
      data.linked_to.map(link => IdentificationLink.fromJSON(link)),
    );
  }
}
