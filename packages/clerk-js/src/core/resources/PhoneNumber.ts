import { BaseResource } from './Base';
import { Verification } from './Verification';
import { IdentificationLink } from './IdentificationLink';
import type {
  IdentificationLinkResource,
  PhoneNumberJSON,
  PhoneNumberResource,
  VerificationResource,
} from '@clerk/types';

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

  create(): Promise<this> {
    return this._basePost({
      body: { phone_number: this.phoneNumber },
    });
  }

  prepareVerification(): Promise<PhoneNumberResource> {
    return this._basePost<PhoneNumberJSON>({
      action: 'prepare_verification',
      body: {
        strategy: 'phone_code',
      },
    });
  }

  attemptVerification(code: string): Promise<PhoneNumberResource> {
    return this._basePost<PhoneNumberJSON>({
      action: 'attempt_verification',
      body: {
        code,
      },
    });
  }

  setReservedForSecondFactor(reserved: boolean): Promise<PhoneNumberResource> {
    return this._basePatch<PhoneNumberJSON>({
      body: { reserved_for_second_factor: reserved },
    });
  }

  makeDefaultSecondFactor(): Promise<PhoneNumberResource> {
    return this._basePatch<PhoneNumberJSON>({
      body: { default_second_factor: true },
    });
  }

  destroy(): Promise<void> {
    return this._baseDelete();
  }

  toString(): string {
    // Filter only numbers from the input
    const match = this.phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }

    return this.phoneNumber;
  }

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
