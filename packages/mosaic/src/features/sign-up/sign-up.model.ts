import type { ClerkError } from '@clerk/shared/error';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { getSignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import type { ActiveIdentifier } from '@clerk/shared/internal/clerk-js/signUpFormFields';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
} from '@clerk/shared/internal/clerk-js/signUpFormFields';
import { __internal_useClerkSignal, useClerk } from '@clerk/shared/react';
import type { SignUpFutureResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { save } from '../../utils/errors';
import type { SignUpFieldName, SignUpFields, SignUpLegalConsent } from './sign-up.types';

export interface SignUpDetailsValues {
  emailAddress?: string;
  phoneNumber?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  legalAccepted?: boolean;
}

export type SignUpIdentifier = Exclude<ActiveIdentifier, undefined>;

export interface SignUpData {
  step: SignUpNextStep;
  mode: 'public' | 'restricted' | 'waitlist';
  initialIdentifier: SignUpIdentifier;
  canSwitchIdentifier: boolean;
  startFieldsFor: (identifier: SignUpIdentifier) => SignUpFields;
  continueFieldsFor: (identifier: SignUpIdentifier) => SignUpFields;
  emailAddress: string | null;
  phoneNumber: string | null;
  legalConsent?: SignUpLegalConsent;
  applicationName: string;
  applicationLogoUrl?: string;
}

export interface SignUpCallbacks {
  create: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
  update: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
  sendEmailCode: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<SignUpNextStep>;
  sendPhoneCode: () => Promise<void>;
  verifyPhoneCode: (code: string) => Promise<SignUpNextStep>;
  finalize: () => Promise<void>;
  reset: () => Promise<void>;
}

export type SignUpModel = { status: 'loading' } | (SignUpData & SignUpCallbacks & { status: 'ready' });

const FIELD_NAMES: readonly SignUpFieldName[] = [
  'firstName',
  'lastName',
  'username',
  'emailAddress',
  'phoneNumber',
  'password',
];

const DETAILS_FIELDS = [...FIELD_NAMES, 'legalAccepted'] as const;

function toViewFields(fields: Partial<Record<string, { required: boolean; disabled?: boolean } | undefined>>) {
  const result: SignUpFields = {};
  for (const name of FIELD_NAMES) {
    const field = fields[name];
    if (field) {
      result[name] = field;
    }
  }
  return result;
}

async function run(call: () => Promise<{ error: ClerkError | null }>): Promise<void> {
  const { error } = await call();
  if (error) {
    throw error;
  }
}

export function useSignUpModel(): SignUpModel {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const { signUp } = __internal_useClerkSignal('signUp');

  if (!clerk.loaded || !environment) {
    return { status: 'loading' };
  }

  const { userSettings, displayConfig } = environment;
  const { attributes } = userSettings;
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const legalConsentRequired = userSettings.signUp.legal_consent_enabled;

  const next = (resource: SignUpFutureResource) => getSignUpNextStep(resource);

  const activeFields = (identifier: SignUpIdentifier) =>
    determineActiveFields({
      attributes,
      activeCommIdentifierType: identifier,
      isProgressiveSignUp,
      legalConsentRequired,
    });

  const details = (values: SignUpDetailsValues) => ({
    emailAddress: values.emailAddress,
    phoneNumber: values.phoneNumber,
    username: values.username,
    firstName: values.firstName,
    lastName: values.lastName,
    legalAccepted: values.legalAccepted,
  });

  return {
    status: 'ready',
    step: getSignUpNextStep(signUp),
    mode: userSettings.signUp.mode,
    initialIdentifier: getInitialActiveIdentifier(attributes, isProgressiveSignUp) ?? null,
    canSwitchIdentifier: emailOrPhone(attributes, isProgressiveSignUp),
    startFieldsFor: identifier => toViewFields(activeFields(identifier)),
    continueFieldsFor: identifier => {
      const fields = activeFields(identifier);
      minimizeFieldsForExistingSignup(fields, signUp);
      return toViewFields(fields);
    },
    emailAddress: signUp.emailAddress,
    phoneNumber: signUp.phoneNumber,
    legalConsent: legalConsentRequired
      ? { termsUrl: displayConfig.termsUrl || undefined, privacyPolicyUrl: displayConfig.privacyPolicyUrl || undefined }
      : undefined,
    applicationName: displayConfig.applicationName,
    applicationLogoUrl: displayConfig.logoImageUrl || undefined,
    create: async values => {
      await save(() => run(() => signUp.create({ ...details(values), password: values.password })), DETAILS_FIELDS);
      return next(signUp);
    },
    update: async values => {
      await save(() => run(() => signUp.update(details(values))), DETAILS_FIELDS);
      return next(signUp);
    },
    sendEmailCode: () => run(() => signUp.verifications.sendEmailCode()),
    verifyEmailCode: async code => {
      await save(() => run(() => signUp.verifications.verifyEmailCode({ code })), ['code']);
      return next(signUp);
    },
    sendPhoneCode: () => run(() => signUp.verifications.sendPhoneCode()),
    verifyPhoneCode: async code => {
      await save(() => run(() => signUp.verifications.verifyPhoneCode({ code })), ['code']);
      return next(signUp);
    },
    finalize: () => run(() => signUp.finalize()),
    reset: () => run(() => signUp.reset()),
  };
}
