import type { MosaicMessages } from '../../localization';
import { fill } from '../../localization';
import { formatPhoneIdentifier } from '../auth-flow/auth-flow.utils';
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
    'notice:start-over',
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

type SignUpCodeStep = Extract<SignUpStep, { kind: 'code' }>;

export function signUpCodeCopy(
  step: SignUpCodeStep,
  m: Messages,
): { title: string; description: string; fieldLabel: string } {
  if (step.purpose === 'verify-email') {
    return {
      title: m.verifyEmail.title,
      description: fill<string>(m.verifyEmail.description, { identifier: step.identifier }),
      fieldLabel: m.verifyEmail.label,
    };
  }
  const { provider } = step;
  return provider
    ? {
        title: fill(m.verifyPhone.titleProvider, { provider }),
        description: fill(m.verifyPhone.descriptionProvider, { provider }),
        fieldLabel: m.verifyPhone.label,
      }
    : { title: m.verifyPhone.title, description: m.verifyPhone.description, fieldLabel: m.verifyPhone.label };
}

export function signUpCodeIdentity(step: SignUpCodeStep, m: Messages): { identifier: string; editLabel: string } {
  return step.purpose === 'verify-email'
    ? { identifier: step.identifier, editLabel: m.editIdentifier }
    : { identifier: formatPhoneIdentifier(step.identifier), editLabel: m.editPhoneNumber };
}

export function signUpCodeSecondaryAction(
  step: SignUpCodeStep,
  m: Messages,
  onCancel?: () => void,
): { label: string; onClick?: () => void } {
  if (step.purpose === 'verify-email') {
    return { label: m.useAnotherMethod, onClick: onCancel };
  }
  return step.provider ? { label: m.verifyPhone.useSms, onClick: onCancel } : { label: m.useAnotherMethod };
}
