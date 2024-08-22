import type { ClerkResource } from './resource';
import type { SessionResource } from './session';
import type { SignInFirstFactor, SignInSecondFactor } from './signIn';
import type { VerificationResource } from './verification';

export interface SessionVerificationResource extends ClerkResource {
  status: SessionVerificationStatus | null;
  level: 'L1.firstFactor' | 'L2.secondFactor' | 'L3.multiFactor';
  session: SessionResource;
  firstFactorVerification: VerificationResource;
  secondFactorVerification: VerificationResource;
  supportedFirstFactors: SignInFirstFactor[];
  supportedSecondFactors: SignInSecondFactor[];
}

export type SessionVerificationStatus = 'needs_first_factor' | 'needs_second_factor' | 'complete';
