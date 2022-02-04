import { IdentificationLinkResource } from './identificationLink';
import { ClerkResource } from './resource';
import { VerificationResource } from './verification';

export type PhoneNumberVerificationStrategy = 'phone_code';

export type PreparePhoneNumberVerificationParams = {
  strategy: PhoneNumberVerificationStrategy;
};

export interface PhoneNumberResource extends ClerkResource {
  id: string;
  phoneNumber: string;
  verification: VerificationResource;
  reservedForSecondFactor: boolean;
  defaultSecondFactor: boolean;
  linkedTo: IdentificationLinkResource[];
  toString: () => string;
  prepareVerification: () => Promise<PhoneNumberResource>;
  attemptVerification: (code: string) => Promise<PhoneNumberResource>;
  makeDefaultSecondFactor: () => Promise<PhoneNumberResource>;
  setReservedForSecondFactor: (
    reserve: boolean,
  ) => Promise<PhoneNumberResource>;
  destroy: () => Promise<void>;
}
