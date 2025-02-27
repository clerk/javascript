import type {
  BackupCodeFactor,
  EmailCodeFactor,
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

export type SessionVerificationTypes = 'strict_mfa' | 'strict' | 'moderate' | 'lax';

export type ReverificationConfig =
  | SessionVerificationTypes
  | {
      level: SessionVerificationLevel;
      afterMinutes: SessionVerificationAfterMinutes;
    };

export type SessionVerificationLevel = 'first_factor' | 'second_factor' | 'multi_factor';
export type SessionVerificationAfterMinutes = number;

export type SessionVerificationFirstFactor = EmailCodeFactor | PhoneCodeFactor | PasswordFactor | PasskeyFactor;
export type SessionVerificationSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor;
