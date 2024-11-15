import type { BackupCodeFactor, EmailCodeFactor, PasswordFactor, PhoneCodeFactor, TOTPFactor } from './factors';
import type { ClerkResource } from './resource';
import type { SessionResource } from './session';
import type { VerificationResource } from './verification';

export interface __experimental_SessionVerificationResource extends ClerkResource {
  status: __experimental_SessionVerificationStatus;
  level: __experimental_SessionVerificationLevel;
  session: SessionResource;
  firstFactorVerification: VerificationResource;
  secondFactorVerification: VerificationResource;
  supportedFirstFactors: __experimental_SessionVerificationFirstFactor[] | null;
  supportedSecondFactors: __experimental_SessionVerificationSecondFactor[] | null;
}

export type __experimental_SessionVerificationStatus = 'needs_first_factor' | 'needs_second_factor' | 'complete';

export type __experimental_SessionVerificationTypes = 'strict_mfa' | 'strict' | 'moderate' | 'lax';

export type __experimental_ReverificationConfig =
  | __experimental_SessionVerificationTypes
  | {
      level: __experimental_SessionVerificationLevel;
      afterMinutes: __experimental_SessionVerificationAfterMinutes;
    };

export type __experimental_SessionVerificationLevel = 'first_factor' | 'second_factor' | 'multi_factor';
export type __experimental_SessionVerificationAfterMinutes = number;

export type __experimental_SessionVerificationFirstFactor = EmailCodeFactor | PhoneCodeFactor | PasswordFactor;
export type __experimental_SessionVerificationSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor;
