import { errorToJSON, parseError } from '@clerk/shared/error';
import type {
  ClerkAPIError,
  PasskeyVerificationResource,
  PhoneCodeChannel,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  SignUpVerificationJSON,
  SignUpVerificationJSONSnapshot,
  SignUpVerificationResource,
  SignUpVerificationsJSON,
  SignUpVerificationsJSONSnapshot,
  SignUpVerificationsResource,
  VerificationJSON,
  VerificationJSONSnapshot,
  VerificationResource,
  VerificationStatus,
} from '@clerk/types';

import { convertJSONToPublicKeyCreateOptions } from '../../utils/passkeys';
import { BaseResource } from './internal';
import { parseJSON } from './parser';

export class Verification extends BaseResource implements VerificationResource {
  pathRoot = '';

  status: VerificationStatus | null = null;
  strategy: string | null = null;
  nonce: string | null = null;
  message: string | null = null;
  externalVerificationRedirectURL: URL | null = null;
  attempts: number | null = null;
  expireAt: Date | null = null;
  error: ClerkAPIError | null = null;
  verifiedAtClient: string | null = null;
  channel?: PhoneCodeChannel;

  constructor(data: VerificationJSON | VerificationJSONSnapshot | null) {
    super();
    this.fromJSON(data);
  }

  verifiedFromTheSameClient = (): boolean => {
    return this.verifiedAtClient === BaseResource.clerk?.client?.id;
  };

  protected fromJSON(data: VerificationJSON | VerificationJSONSnapshot | null): this {
    Object.assign(
      this,
      parseJSON<Verification>(data, {
        dateFields: ['expireAt'],
        customTransforms: {
          error: (value: any) => (value ? parseError(value) : null),
          externalVerificationRedirectURL: (value: string | null) => (value ? new URL(value) : null),
        },
        defaultValues: {
          status: null,
          strategy: null,
          nonce: null,
          message: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): VerificationJSONSnapshot {
    return {
      object: 'verification',
      id: this.id || '',
      status: this.status,
      strategy: this.strategy,
      nonce: this.nonce,
      message: this.message,
      external_verification_redirect_url: this.externalVerificationRedirectURL?.toString() || null,
      attempts: this.attempts,
      expire_at: this.expireAt?.getTime() || null,
      error: errorToJSON(this.error),
      verified_at_client: this.verifiedAtClient,
    };
  }
}

export class PasskeyVerification extends Verification implements PasskeyVerificationResource {
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions | null = null;

  constructor(data: VerificationJSON | VerificationJSONSnapshot | null) {
    super(data);
    this.fromJSON(data);
  }

  /**
   * Transform base64url encoded strings to ArrayBuffer
   */
  protected fromJSON(data: VerificationJSON | VerificationJSONSnapshot | null): this {
    super.fromJSON(data);
    Object.assign(
      this,
      parseJSON<PasskeyVerification>(data, {
        customTransforms: {
          publicKey: (value: string | null) =>
            value && data?.nonce ? convertJSONToPublicKeyCreateOptions(JSON.parse(data.nonce)) : null,
        },
        defaultValues: {
          publicKey: null,
        },
      }),
    );
    return this;
  }
}

export class SignUpVerifications implements SignUpVerificationsResource {
  emailAddress: SignUpVerificationResource;
  phoneNumber: SignUpVerificationResource;
  web3Wallet: SignUpVerificationResource;
  externalAccount: VerificationResource;

  constructor(data: SignUpVerificationsJSON | SignUpVerificationsJSONSnapshot | null) {
    if (data) {
      this.emailAddress = new SignUpVerification(data.email_address);
      this.phoneNumber = new SignUpVerification(data.phone_number);
      this.web3Wallet = new SignUpVerification(data.web3_wallet);
      this.externalAccount = new Verification(data.external_account);
    } else {
      this.emailAddress = new SignUpVerification(null);
      this.phoneNumber = new SignUpVerification(null);
      this.web3Wallet = new SignUpVerification(null);
      this.externalAccount = new Verification(null);
    }
  }

  public __internal_toSnapshot(): SignUpVerificationsJSONSnapshot {
    return {
      email_address: this.emailAddress.__internal_toSnapshot(),
      phone_number: this.phoneNumber.__internal_toSnapshot(),
      web3_wallet: this.web3Wallet.__internal_toSnapshot(),
      external_account: this.externalAccount.__internal_toSnapshot(),
    };
  }
}

export class SignUpVerification extends Verification {
  nextAction: string = '';
  supportedStrategies: string[] = [];

  constructor(data: SignUpVerificationJSON | SignUpVerificationJSONSnapshot | null) {
    super(data);
    Object.assign(
      this,
      parseJSON<SignUpVerification>(data, {
        defaultValues: {
          nextAction: '',
          supportedStrategies: [],
        },
      }),
    );
  }

  public __internal_toSnapshot(): SignUpVerificationJSONSnapshot {
    return {
      ...super.__internal_toSnapshot(),
      next_action: this.nextAction,
      supported_strategies: this.supportedStrategies,
    };
  }
}
