import type { IdentificationLinkResource } from './identificationLink';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { ClerkResource } from './resource';
import type { PhoneNumberJSONSnapshot } from './snapshots';
import type { PhoneCodeStrategy } from './strategies';
import type { VerificationResource } from './verification';

export type PhoneNumberVerificationStrategy = PhoneCodeStrategy;

export type PreparePhoneNumberVerificationParams = {
  strategy: PhoneNumberVerificationStrategy;
  channel?: PhoneCodeChannel;
};

export type AttemptPhoneNumberVerificationParams = {
  code: string;
};

export type SetReservedForSecondFactorParams = {
  reserved: boolean;
};

export interface PhoneNumberResource extends ClerkResource {
  id: string;
  phoneNumber: string;
  verification: VerificationResource;
  reservedForSecondFactor: boolean;
  defaultSecondFactor: boolean;
  linkedTo: IdentificationLinkResource[];
  backupCodes?: string[];
  toString: () => string;
  prepareVerification: () => Promise<PhoneNumberResource>;
  attemptVerification: (params: AttemptPhoneNumberVerificationParams) => Promise<PhoneNumberResource>;
  makeDefaultSecondFactor: () => Promise<PhoneNumberResource>;
  setReservedForSecondFactor: (params: SetReservedForSecondFactorParams) => Promise<PhoneNumberResource>;
  destroy: () => Promise<void>;
  create: () => Promise<PhoneNumberResource>;
  __internal_toSnapshot: () => PhoneNumberJSONSnapshot;
}
