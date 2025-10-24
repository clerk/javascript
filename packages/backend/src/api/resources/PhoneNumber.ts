import { IdentificationLink } from './IdentificationLink';
import type { PhoneNumberJSON } from './JSON';
import { Verification } from './Verification';

/**
 * The Backend `PhoneNumber` object describes a phone number. Phone numbers can be used as a proof of identification for users, or simply as a means of contacting users.
 *
 * Phone numbers must be **verified** to ensure that they can be assigned to their rightful owners. The `PhoneNumber` object holds all the necessary state around the verification process.
 *
 * Finally, phone numbers can be used as part of [multi-factor authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication). During sign in, users can opt in to an extra verification step where they will receive an SMS message with a one-time code. This code must be entered to complete the sign in process.
 */
export class PhoneNumber {
  constructor(
    /**
     * The unique identifier for this phone number.
     */
    readonly id: string,
    /**
     * The value of this phone number, in [E.164 format](https://en.wikipedia.org/wiki/E.164).
     */
    readonly phoneNumber: string,
    /**
     * Set to `true` if this phone number is reserved for multi-factor authentication (2FA). Set to `false` otherwise.
     */
    readonly reservedForSecondFactor: boolean,
    /**
     * Set to `true` if this phone number is the default second factor. Set to `false` otherwise. A user must have exactly one default second factor, if multi-factor authentication (2FA) is enabled.
     */
    readonly defaultSecondFactor: boolean,
    /**
     * An object holding information on the verification of this phone number.
     */
    readonly verification: Verification | null,
    /**
     * An object containing information about any other identification that might be linked to this phone number.
     */
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
