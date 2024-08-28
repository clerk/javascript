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
export type __experimental_SessionVerificationLevel = 'L1.firstFactor' | 'L2.secondFactor' | 'L3.multiFactor';
export type __experimental_SessionVerificationMaxAge = 'A1.10min' | 'A2.1hr' | 'A3.4hr' | 'A4.1day' | 'A5.1wk';

export type __experimental_SessionVerificationFirstFactor = EmailCodeFactor | PhoneCodeFactor | PasswordFactor;
export type __experimental_SessionVerificationSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor;
