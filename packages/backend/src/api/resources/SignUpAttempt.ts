import type { SignUpStatus } from '@clerk/shared/types';

import type { SignUpVerificationNextAction } from './Enums';
import type { SignUpJSON, SignUpVerificationJSON, SignUpVerificationsJSON } from './JSON';

export class SignUpAttemptVerification {
  constructor(
    readonly nextAction: SignUpVerificationNextAction,
    readonly supportedStrategies: string[],
  ) {}

  static fromJSON(data: SignUpVerificationJSON): SignUpAttemptVerification {
    return new SignUpAttemptVerification(data.next_action, data.supported_strategies);
  }
}

export class SignUpAttemptVerifications {
  constructor(
    readonly emailAddress: SignUpAttemptVerification | null,
    readonly phoneNumber: SignUpAttemptVerification | null,
    readonly web3Wallet: SignUpAttemptVerification | null,
    readonly externalAccount: object | null,
  ) {}

  static fromJSON(data: SignUpVerificationsJSON): SignUpAttemptVerifications {
    return new SignUpAttemptVerifications(
      data.email_address && SignUpAttemptVerification.fromJSON(data.email_address),
      data.phone_number && SignUpAttemptVerification.fromJSON(data.phone_number),
      data.web3_wallet && SignUpAttemptVerification.fromJSON(data.web3_wallet),
      data.external_account,
    );
  }
}

export class SignUpAttempt {
  constructor(
    readonly id: string,
    readonly status: SignUpStatus,
    readonly requiredFields: string[],
    readonly optionalFields: string[],
    readonly missingFields: string[],
    readonly unverifiedFields: string[],
    readonly verifications: SignUpAttemptVerifications | null,
    readonly username: string | null,
    readonly emailAddress: string | null,
    readonly phoneNumber: string | null,
    readonly web3Wallet: string | null,
    readonly passwordEnabled: boolean,
    readonly firstName: string | null,
    readonly lastName: string | null,
    readonly customAction: boolean,
    readonly externalId: string | null,
    readonly createdSessionId: string | null,
    readonly createdUserId: string | null,
    readonly abandonAt: number | null,
    readonly legalAcceptedAt: number | null,
    readonly publicMetadata?: Record<string, unknown> | null,
    readonly unsafeMetadata?: Record<string, unknown> | null,
  ) {}

  static fromJSON(data: SignUpJSON): SignUpAttempt {
    return new SignUpAttempt(
      data.id,
      data.status,
      data.required_fields,
      data.optional_fields,
      data.missing_fields,
      data.unverified_fields,
      data.verifications ? SignUpAttemptVerifications.fromJSON(data.verifications) : null,
      data.username,
      data.email_address,
      data.phone_number,
      data.web3_wallet,
      data.password_enabled,
      data.first_name,
      data.last_name,
      data.custom_action,
      data.external_id,
      data.created_session_id,
      data.created_user_id,
      data.abandon_at,
      data.legal_accepted_at,
      data.public_metadata,
      data.unsafe_metadata,
    );
  }
}
