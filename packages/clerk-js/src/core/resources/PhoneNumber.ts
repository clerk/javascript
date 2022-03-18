import type {
  AttemptPhoneNumberVerificationParams,
  IdentificationLinkResource,
  PhoneNumberJSON,
  PhoneNumberResource,
  SetReservedForSecondFactorParams,
  VerificationResource,
} from '@clerk/types';

import { BaseResource, IdentificationLink, Verification } from './internal';

export class PhoneNumber extends BaseResource implements PhoneNumberResource {
  id!: string;
  phoneNumber = '';
  reservedForSecondFactor = false;
  defaultSecondFactor = false;
  linkedTo: IdentificationLinkResource[] = [];
  verification!: VerificationResource;

  public constructor(data: Partial<PhoneNumberJSON>, pathRoot: string);
  public constructor(data: PhoneNumberJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  create = (): Promise<this> =>
    this._basePost({
      body: { phone_number: this.phoneNumber },
    });

  prepareVerification = (): Promise<PhoneNumberResource> => {
    return this._basePost<PhoneNumberJSON>({
      action: 'prepare_verification',
      body: { strategy: 'phone_code' },
    });
  };

  attemptVerification = (
    params: AttemptPhoneNumberVerificationParams,
  ): Promise<PhoneNumberResource> => {
    const { code } = params || {};
    return this._basePost<PhoneNumberJSON>({
      action: 'attempt_verification',
      body: { code },
    });
  };
  setReservedForSecondFactor = (
    params: SetReservedForSecondFactorParams,
  ): Promise<PhoneNumberResource> => {
    const { reserved } = params || {};
    return this._basePatch<PhoneNumberJSON>({
      body: { reserved_for_second_factor: reserved },
    });
  };

  makeDefaultSecondFactor = (): Promise<PhoneNumberResource> => {
    return this._basePatch<PhoneNumberJSON>({
      body: { default_second_factor: true },
    });
  };

  destroy = (): Promise<void> => this._baseDelete();

  toString = (): string => {
    // Filter only numbers from the input
    const match = this.phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }

    return this.phoneNumber;
  };

  protected fromJSON(data: PhoneNumberJSON): this {
    this.id = data.id;
    this.phoneNumber = data.phone_number;
    this.reservedForSecondFactor = data.reserved_for_second_factor;
    this.defaultSecondFactor = data.default_second_factor;
    this.verification = new Verification(data.verification);
    this.linkedTo = (data.linked_to || []).map(
      link => new IdentificationLink(link),
    );
    return this;
  }
}
