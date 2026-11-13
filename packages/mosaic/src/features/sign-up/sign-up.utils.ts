import type { MosaicMessages } from '../../localization';
import type { SignInStep } from '../sign-in';
import type { SignUpStep } from './sign-up.types';

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

type DetailsStep = Extract<SignUpStep, { kind: 'details' }>;

export function signUpDetailsHeading(
  step: DetailsStep,
  m: MosaicMessages['signUp'],
  legalConsent: MosaicMessages['signIn']['signUp']['legalConsent'],
): { title: string; description: string } {
  if (step.legalConsent && Object.keys(step.fields).length === 0) {
    return { title: legalConsent.title, description: legalConsent.description };
  }
  return step.purpose === 'start' ? m.start : m.continue;
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
