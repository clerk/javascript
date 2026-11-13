import type { MosaicMessages } from '../../localization';
import type { SignInStep } from '../sign-in';
import type { SignUpDetails, SignUpFieldName, SignUpFields, SignUpLegalConsent, SignUpStep } from './sign-up.types';

type Messages = MosaicMessages['signUp'];

export const signUpStepIds = {
  details: ['details:start', 'details:continue'],
  alternativePhone: ['alternative-phone'],
  code: ['code:verify-email', 'code:verify-phone'],
  choice: ['choice:enterprise-connections', 'choice:wallets'],
  notice: [
    'notice:verify-email-link',
    'notice:email-link-status',
    'notice:restricted',
    'notice:waitlist',
    'notice:loading',
    'notice:protect-check',
    'notice:action-blocked',
  ],
} as const;

export type SignUpStepKey = (typeof signUpStepIds)[keyof typeof signUpStepIds][number];

export function signUpStepKey(step: SignUpStep): SignUpStepKey {
  switch (step.kind) {
    case 'alternative-phone':
      return step.kind;
    case 'details':
      return `details:${step.purpose}`;
    case 'code':
      return `code:${step.purpose}`;
    case 'choice':
      return `choice:${step.purpose}`;
    case 'notice':
      return `notice:${step.purpose}`;
  }
}

const signUpFieldOrder: readonly SignUpFieldName[] = [
  'firstName',
  'lastName',
  'username',
  'emailAddress',
  'phoneNumber',
  'password',
];

export function signUpFieldNames(fields: SignUpFields): SignUpFieldName[] {
  return signUpFieldOrder.filter(name => fields[name]);
}

export function signUpDetailsHeading(step: SignUpDetails, m: Messages): { title: string; description: string } {
  if (step.legalConsent && signUpFieldNames(step.fields).length === 0) {
    return { title: m.legalConsent.title, description: m.legalConsent.description };
  }
  return step.purpose === 'continue' ? m.continue : m.start;
}

export function legalConsentLabel({ termsUrl, privacyPolicyUrl }: SignUpLegalConsent, m: Messages) {
  if (termsUrl && !privacyPolicyUrl) {
    return m.legalConsent.termsOnly;
  }
  if (privacyPolicyUrl && !termsUrl) {
    return m.legalConsent.privacyOnly;
  }
  return m.legalConsent.termsAndPrivacy;
}

export function signUpCodeStep(step: Extract<SignUpStep, { kind: 'code' }>): Extract<SignInStep, { kind: 'code' }> {
  return {
    kind: 'code',
    purpose: step.purpose,
    channel: step.purpose === 'verify-email' ? 'email' : 'phone',
    identifier: step.identifier,
    provider: step.provider,
  };
}
