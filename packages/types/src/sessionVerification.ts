import type {
  BackupCodeFactor,
  EmailCodeFactor,
  EnterpriseSSOFactor,
  PasskeyFactor,
  PasswordFactor,
  PhoneCodeFactor,
  TOTPFactor,
} from './factors';
import type { ClerkResource } from './resource';
import type { SessionResource } from './session';
import type { VerificationResource } from './verification';

export interface SessionVerificationResource extends ClerkResource {
  status: SessionVerificationStatus;
  level: SessionVerificationLevel;
  session: SessionResource;
  firstFactorVerification: VerificationResource;
  secondFactorVerification: VerificationResource;
  supportedFirstFactors: SessionVerificationFirstFactor[] | null;
  supportedSecondFactors: SessionVerificationSecondFactor[] | null;
}

export type SessionVerificationStatus = 'needs_first_factor' | 'needs_second_factor' | 'complete';

/**
 * @inline
 */
export type SessionVerificationTypes = 'strict_mfa' | 'strict' | 'moderate' | 'lax';

/**
 * The `ReverificationConfig` type has the following properties:
 */
export type ReverificationConfig =
  | SessionVerificationTypes
  | {
      /**
       * The reverification level of credentials to check for.
       */
      level: SessionVerificationLevel;
      /**
       * The age of the factor level to check for. Value should be greater than or equal to 1 and less than 99,999.
       */
      afterMinutes: SessionVerificationAfterMinutes;
    };

/**
 * @inline
 */
export type SessionVerificationLevel = 'first_factor' | 'second_factor' | 'multi_factor';
export type SessionVerificationAfterMinutes = number;

export type SessionVerificationFirstFactor =
  | EmailCodeFactor
  | PhoneCodeFactor
  | PasswordFactor
  | PasskeyFactor
  /**
   * @experimental
   */
  | EnterpriseSSOFactor;
export type SessionVerificationSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor;
