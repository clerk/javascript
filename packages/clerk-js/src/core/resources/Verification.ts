import { ClerkAPIError, errorToJSON } from '@clerk/shared/error';
import type {
  PasskeyVerificationResource,
  PhoneCodeChannel,
  PublicKeyCredentialCreationOptionsJSON,
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
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { convertJSONToPublicKeyCreateOptions } from '../../utils/passkeys';
import { BaseResource } from './internal';

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
    if (data) {
      this.status = data.status;
      this.verifiedAtClient = data.verified_at_client;
      this.strategy = data.strategy;
      this.nonce = data.nonce || null;
      this.message = data.message || null;
      if (data.external_verification_redirect_url) {
        this.externalVerificationRedirectURL = new URL(data.external_verification_redirect_url);
      } else {
        this.externalVerificationRedirectURL = null;
      }
      this.attempts = data.attempts;
      this.expireAt = unixEpochToDate(data.expire_at || undefined);
      this.error = data.error ? new ClerkAPIError(data.error) : null;
      this.channel = data.channel || undefined;
    }
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
    if (data?.nonce) {
      this.publicKey = convertJSONToPublicKeyCreateOptions(
        JSON.parse(data.nonce) as PublicKeyCredentialCreationOptionsJSON,
      );
    }
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
  nextAction: string;
  supportedStrategies: string[];

  constructor(data: SignUpVerificationJSON | SignUpVerificationJSONSnapshot | null) {
    super(data);
    if (data) {
      this.nextAction = data.next_action;
      this.supportedStrategies = data.supported_strategies;
    } else {
      this.nextAction = '';
      this.supportedStrategies = [];
    }
  }

  public __internal_toSnapshot(): SignUpVerificationJSONSnapshot {
    return {
      ...super.__internal_toSnapshot(),
      next_action: this.nextAction,
      supported_strategies: this.supportedStrategies,
    };
  }
}
