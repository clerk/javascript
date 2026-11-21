import type { SignUpField, SignUpFutureResource } from '@clerk/shared/types';

import type { MosaicMessages } from '../../localization';
import { fill } from '../../localization';
import { formatPhoneIdentifier } from '../auth-flow/auth-flow.utils';
import type { SignUpIdentifier } from './sign-up.model';
import type { SignUpCode, SignUpDetails, SignUpFieldName, SignUpFields, SignUpLegalConsent } from './sign-up.types';

type Messages = MosaicMessages['signUp'];

export const signUpFieldOrder: readonly SignUpFieldName[] = [
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

export function signUpCodeCopy(
  step: SignUpCode,
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

export function signUpCodeIdentity(step: SignUpCode, m: Messages): { identifier: string; editLabel: string } {
  return step.purpose === 'verify-email'
    ? { identifier: step.identifier, editLabel: m.editIdentifier }
    : { identifier: formatPhoneIdentifier(step.identifier), editLabel: m.editPhoneNumber };
}

export function signUpCodeSecondaryAction(
  step: SignUpCode,
  m: Messages,
  onCancel?: () => void,
): { label: string; onClick?: () => void } {
  if (step.purpose === 'verify-email') {
    return { label: m.useAnotherMethod, onClick: onCancel };
  }
  return step.provider ? { label: m.verifyPhone.useSms, onClick: onCancel } : { label: m.useAnotherMethod };
}

const FORM_FIELDS: Partial<Record<SignUpField, SignUpFieldName>> = {
  first_name: 'firstName',
  last_name: 'lastName',
  username: 'username',
  password: 'password',
  email_address: 'emailAddress',
  phone_number: 'phoneNumber',
};

type SignUpFieldLists = Pick<SignUpFutureResource, 'missingFields' | 'optionalFields' | 'unverifiedFields'>;

function missingIdentifiers({ missingFields, optionalFields }: SignUpFieldLists): SignUpField[] {
  return missingFields.filter(
    field =>
      field === 'email_address_or_phone_number' ||
      (optionalFields.includes(field) &&
        (field === 'email_address' || field === 'phone_number' || field === 'username')),
  );
}

const CONTINUE_REQUIREMENTS: readonly SignUpField[] = ['legal_accepted', 'email_address_or_phone_number'];

export function continueCanSatisfy(signUp: SignUpFieldLists, providers: readonly string[]): boolean {
  const asksForIdentifier = missingIdentifiers(signUp).length > 0;
  return signUp.missingFields.every(
    field =>
      field in FORM_FIELDS ||
      providers.includes(field) ||
      CONTINUE_REQUIREMENTS.includes(field) ||
      (asksForIdentifier && signUp.optionalFields.includes(field)),
  );
}

export function missesEitherIdentifier(signUp: SignUpFieldLists): boolean {
  const identifiers = missingIdentifiers(signUp);
  return (
    identifiers.includes('email_address_or_phone_number') ||
    (identifiers.includes('email_address') && identifiers.includes('phone_number'))
  );
}

export function continueFields(signUp: SignUpFieldLists, identifier: SignUpIdentifier): SignUpFields {
  const identifiers = missingIdentifiers(signUp);
  const fields: SignUpFields = {};
  for (const name of signUp.missingFields) {
    const field = FORM_FIELDS[name];
    if (field && !identifiers.includes(name)) {
      fields[field] = { required: true };
    }
  }
  if (missesEitherIdentifier(signUp)) {
    fields[identifier === 'phoneNumber' ? 'phoneNumber' : 'emailAddress'] = { required: true };
  } else {
    const only = identifiers.find(name => name !== 'username') ?? identifiers[0];
    const field = only ? FORM_FIELDS[only] : undefined;
    if (field) {
      fields[field] = { required: true };
    }
  }
  for (const name of signUp.unverifiedFields) {
    const field = FORM_FIELDS[name];
    if (field) {
      fields[field] = { required: true };
    }
  }
  return fields;
}
