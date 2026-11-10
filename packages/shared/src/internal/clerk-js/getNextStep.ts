import type { ProtectCheckResource, SignUpField, SignUpIdentificationField, VerificationResource } from '../../types';

export type NextStep =
  | { type: 'identifier' }
  | { type: 'first_factor'; strategy: string | null; sent: boolean }
  | { type: 'second_factor'; strategy: string | null; sent: boolean }
  | { type: 'client_trust' }
  | { type: 'new_password' }
  | { type: 'protect' }
  | { type: 'transfer' }
  | { type: 'start' }
  | { type: 'enterprise_sso' }
  | { type: 'fields'; fields: SignUpField[] }
  | { type: 'verify_email'; target: string | null; sent: boolean }
  | { type: 'verify_phone'; target: string | null; sent: boolean }
  | { type: 'complete'; createdSessionId: string | null }
  | { type: 'unknown' };

type VerificationInput = Pick<VerificationResource, 'status' | 'strategy'>;

export type SignInNextStepInput = {
  status: string | null;
  protectCheck: ProtectCheckResource | null;
  isTransferable: boolean;
  firstFactorVerification: VerificationInput;
  secondFactorVerification: VerificationInput;
  createdSessionId: string | null;
};

export type SignUpNextStepInput = {
  id?: string | undefined;
  status: string | null;
  protectCheck: ProtectCheckResource | null;
  isTransferable: boolean;
  missingFields: SignUpField[];
  unverifiedFields: SignUpIdentificationField[];
  emailAddress: string | null;
  phoneNumber: string | null;
  verifications: {
    emailAddress: { nextAction: string };
    phoneNumber: { nextAction: string };
  };
  createdSessionId: string | null;
};

/**
 * Computes the next step of a sign-in from the fields FAPI sends today.
 *
 * @internal
 */
export function getSignInNextStep(signIn: SignInNextStepInput): NextStep {
  if (signIn.protectCheck) {
    return { type: 'protect' };
  }
  if (signIn.isTransferable) {
    return { type: 'transfer' };
  }
  switch (signIn.status) {
    case null:
    case 'needs_identifier':
      return { type: 'identifier' };
    case 'needs_first_factor':
      return { type: 'first_factor', ...verificationState(signIn.firstFactorVerification) };
    case 'needs_second_factor':
      return { type: 'second_factor', ...verificationState(signIn.secondFactorVerification) };
    case 'needs_client_trust':
      return { type: 'client_trust' };
    case 'needs_new_password':
      return { type: 'new_password' };
    case 'needs_protect_check':
      return { type: 'protect' };
    case 'complete':
      return { type: 'complete', createdSessionId: signIn.createdSessionId };
    default:
      return { type: 'unknown' };
  }
}

/**
 * Computes the next step of a sign-up from the fields FAPI sends today.
 *
 * @internal
 */
export function getSignUpNextStep(signUp: SignUpNextStepInput): NextStep {
  if (!signUp.id || signUp.status === null) {
    return { type: 'start' };
  }
  if (signUp.status === 'complete') {
    return { type: 'complete', createdSessionId: signUp.createdSessionId };
  }
  if (signUp.status !== 'missing_requirements') {
    return { type: 'unknown' };
  }
  if (signUp.protectCheck || signUp.missingFields.includes('protect_check')) {
    return { type: 'protect' };
  }
  if (signUp.isTransferable) {
    return { type: 'transfer' };
  }
  if (signUp.missingFields.includes('enterprise_sso')) {
    return { type: 'enterprise_sso' };
  }
  if (signUp.missingFields.length > 0) {
    return { type: 'fields', fields: signUp.missingFields };
  }
  if (signUp.unverifiedFields.includes('email_address')) {
    return {
      type: 'verify_email',
      target: signUp.emailAddress,
      sent: signUp.verifications.emailAddress.nextAction === 'needs_attempt',
    };
  }
  if (signUp.unverifiedFields.includes('phone_number')) {
    return {
      type: 'verify_phone',
      target: signUp.phoneNumber,
      sent: signUp.verifications.phoneNumber.nextAction === 'needs_attempt',
    };
  }
  return { type: 'unknown' };
}

function verificationState(verification: VerificationInput): { strategy: string | null; sent: boolean } {
  return { strategy: verification.strategy, sent: verification.status === 'unverified' };
}
