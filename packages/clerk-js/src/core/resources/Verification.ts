import { parseError } from '@clerk/shared/error';
import type {
  ClerkAPIError,
  PasskeyVerificationResource,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  SignUpVerificationJSON,
  SignUpVerificationResource,
  SignUpVerificationsJSON,
  SignUpVerificationsResource,
  VerificationJSON,
  VerificationResource,
  VerificationStatus,
} from '@clerk/types';

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

  constructor(data: VerificationJSON | null) {
    super();
    this.fromJSON(data);
  }

  verifiedFromTheSameClient = (): boolean => {
    return this.verifiedAtClient === BaseResource.clerk?.client?.id;
  };

  protected fromJSON(data: VerificationJSON | null): this {
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
      this.expireAt = unixEpochToDate(data.expire_at);
      this.error = data.error ? parseError(data.error) : null;
    }
    return this;
  }
}

export class PasskeyVerification extends Verification implements PasskeyVerificationResource {
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions | null = null;

  constructor(data: VerificationJSON | null) {
    super(data);
    this.fromJSON(data);
  }

  /**
   * Transform base64url encoded strings to ArrayBuffer
   */
  protected fromJSON(data: VerificationJSON | null): this {
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

  constructor(data: SignUpVerificationsJSON | null) {
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
}

export class SignUpVerification extends Verification {
  nextAction: string;
  supportedStrategies: string[];

  constructor(data: SignUpVerificationJSON | null) {
    super(data);
    if (data) {
      this.nextAction = data.next_action;
      this.supportedStrategies = data.supported_strategies;
    } else {
      this.nextAction = '';
      this.supportedStrategies = [];
    }
  }
}
