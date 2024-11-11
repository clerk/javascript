import type { BackupCodeFactor, EmailCodeFactor, PasswordFactor, PhoneCodeFactor, TOTPFactor } from './factors';
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

export type SessionVerificationTypes = 'veryStrict' | 'strict' | 'moderate' | 'lax';

export type ReverificationConfig =
  | SessionVerificationTypes
  | {
      level: SessionVerificationLevel;
      afterMinutes: SessionVerificationAfterMinutes;
    };

export type SessionVerificationLevel = 'firstFactor' | 'secondFactor' | 'multiFactor';
export type SessionVerificationAfterMinutes = number;

export type SessionVerificationFirstFactor = EmailCodeFactor | PhoneCodeFactor | PasswordFactor;
export type SessionVerificationSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor;
