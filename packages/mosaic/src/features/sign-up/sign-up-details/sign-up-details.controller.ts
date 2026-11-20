import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { useState } from 'react';

import type { FieldFeedback } from '../../../components/form';
import { useForm } from '../../../components/form';
import { useDebouncedAsync } from '../../../hooks/use-debounced-async';
import { useMessages } from '../../../localization';
import type { SignUpDetailsModel, SignUpDetailsValues, SignUpIdentifier } from '../sign-up.model';
import type { SignUpDetails, SignUpDetailsScreen, SignUpFieldName, SignUpFields, SignUpValues } from '../sign-up.types';
import { signUpFieldNames } from '../sign-up.utils';

const emptyValues: SignUpValues = {
  identifier: '',
  emailAddress: '',
  phoneNumber: '',
  password: '',
  code: '',
  backupCode: '',
  firstName: '',
  lastName: '',
  username: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: false,
  legalAccepted: false,
};

function otherIdentifier(identifier: SignUpIdentifier): 'emailAddress' | 'phoneNumber' {
  return identifier === 'phoneNumber' ? 'emailAddress' : 'phoneNumber';
}

function canSwitch(purpose: 'start' | 'continue', details: SignUpDetailsModel): boolean {
  return purpose === 'continue' ? details.continueCanSwitchIdentifier : details.canSwitchIdentifier;
}

function detailsStep(
  purpose: 'start' | 'continue',
  fields: SignUpFields,
  details: SignUpDetailsModel,
  identifier: SignUpIdentifier,
): SignUpDetails {
  return {
    purpose,
    fields,
    nextField: canSwitch(purpose, details) && identifier ? otherIdentifier(identifier) : undefined,
    legalConsent: purpose === 'continue' ? details.continueLegalConsent : details.legalConsent,
  };
}

function hasRequired(values: SignUpValues, fields: SignUpFields, consentRequired: boolean): boolean {
  const filled = signUpFieldNames(fields).every(name => !fields[name]?.required || values[name].trim() !== '');
  return filled && (!consentRequired || values.legalAccepted);
}

function detailsValues(values: SignUpValues, fields: SignUpFields): SignUpDetailsValues {
  const pick = (name: SignUpFieldName) => (fields[name] ? values[name] : undefined);
  return {
    emailAddress: pick('emailAddress'),
    phoneNumber: pick('phoneNumber'),
    username: pick('username')?.trim(),
    password: pick('password'),
    firstName: pick('firstName'),
    lastName: pick('lastName'),
    legalAccepted: values.legalAccepted || undefined,
  };
}

interface SignUpDetailsOptions {
  purpose: 'start' | 'continue';
  isBusy: boolean;
  globalErrorMessage?: string;
  onNext: (step: SignUpNextStep) => void;
  onSignIn: () => void;
}

export function useSignUpDetailsController(
  details: SignUpDetailsModel,
  { purpose, isBusy, globalErrorMessage, onNext, onSignIn }: SignUpDetailsOptions,
) {
  const [chosenIdentifier, setChosenIdentifier] = useState<SignUpIdentifier | undefined>(undefined);
  const genericError = useMessages('errors').generic;
  const identifier = chosenIdentifier ?? details.initialIdentifier;
  const startFields = details.startFieldsFor(identifier);
  const continueFields = details.continueFieldsFor(identifier);
  const fields = purpose === 'continue' ? continueFields : startFields;

  const consentRequired = Boolean(purpose === 'continue' ? details.continueLegalConsent : details.legalConsent);

  const form = useForm<SignUpValues, SignUpNextStep | undefined>({
    initialValues: { ...emptyValues, ...details.prefill },
    canSubmit: values => hasRequired(values, fields, consentRequired),
    onSubmit: values => {
      const submitted = detailsValues(values, fields);
      return purpose === 'continue'
        ? details.update(submitted)
        : details.create({ ...submitted, ...details.startHiddenValuesFor(identifier) });
    },
    onSuccess: nextStep => {
      if (nextStep) {
        onNext(nextStep);
      }
    },
  });

  const password = form.values.password;
  const strength = useDebouncedAsync(password, value => details.validatePassword(value), {
    delayMs: DEBOUNCE_MS,
    enabled: Boolean(fields.password) && (password !== '' || form.fields.password.touched),
  });
  const passwordFeedback: FieldFeedback | undefined = strength.isError
    ? { type: 'error', message: genericError }
    : strength.data;
  const isPending = form.isSubmitting || isBusy;

  const screen: Omit<SignUpDetailsScreen, 'step' | 'onSwitchField'> = {
    socialProviders: [],
    onSelectProvider: () => undefined,
    form,
    onSubmit: form.handleSubmit,
    isPending,
    isDisabled: isPending,
    globalErrorMessage: form.error ?? globalErrorMessage,
    passwordFeedback,
    onSignIn,
  };

  const switchField = (purpose: 'start' | 'continue') =>
    canSwitch(purpose, details) ? () => setChosenIdentifier(otherIdentifier(identifier)) : undefined;

  return {
    start: {
      ...screen,
      step: detailsStep('start', startFields, details, identifier),
      onSwitchField: switchField('start'),
    },
    continue: {
      ...screen,
      step: detailsStep('continue', continueFields, details, identifier),
      onSwitchField: switchField('continue'),
    },
    error: form.error,
    reset: form.reset,
  };
}
