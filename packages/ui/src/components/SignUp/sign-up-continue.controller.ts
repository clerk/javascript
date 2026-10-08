import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { buildRequest, useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { useSignUpContinueModel } from './sign-up-continue.model';
import type { ActiveIdentifier } from './signUpFormHelpers';

export const useSignUpContinueController = (model: ReturnType<typeof useSignUpContinueModel>) => {
  const card = useCardState();
  const [activeCommIdentifierType, setActiveCommIdentifierType] = useState(model.initialActiveIdentifier);
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const current = useRef({ key: model.requestKey, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  // TODO: This form should be shared between SignUpStart and SignUpContinue
  const formState = {
    firstName: useFormControl('firstName', model.initialValues.firstName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', model.initialValues.lastName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', model.initialValues.emailAddress || model.signUpEmailAddress || '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', model.initialValues.username || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
      transformer: value => value.trim(),
      buildErrorMessage: model.buildUsernameError,
    }),
    phoneNumber: useFormControl('phoneNumber', model.initialValues.phoneNumber || '', {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__signUpPassword'),
      validatePassword: true,
    }),
    legalAccepted: useFormControl('legalAccepted', '', {
      type: 'checkbox',
      label: '',
      defaultChecked: false,
      isRequired: model.legalConsentRequired,
    }),
  } as const;

  useEffect(() => {
    // Redirect to sign-up if there is no persisted sign-up
    if (!model.hasSignUp && !model.isSetActiveInProgress) {
      void model.navigateToSignUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = model.hasSignUp ? model.getFields(activeCommIdentifierType, !!formState.emailAddress.value) : null;

  const handleChangeActive = (type: ActiveIdentifier) => {
    if (!canRun() || !model.canToggleEmailPhone || owner.pending) {
      return;
    }
    setActiveCommIdentifierType(type);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fields || !canRun()) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }

    type FormStateKey = keyof typeof formState;
    const fieldsToSubmit = Object.entries(fields).reduce(
      (acc, [key, value]) => [
        ...acc,
        ...(value && formState[key as FormStateKey] ? [formState[key as FormStateKey]] : []),
      ],
      [] as Array<FormControlState>,
    );

    // Add both email & phone to the submitted fields to trigger and render an error for both respective inputs in
    // case all the below requirements are met:
    // 1. Sign up contains both in the missing fields
    // 2. The instance settings has both email & phone as optional (emailOrPhone)
    // 3. Neither of them is provided
    const emailAddressProvided = !!(fieldsToSubmit.find(field => field.id === 'emailAddress')?.value || '');
    const phoneNumberProvided = !!(fieldsToSubmit.find(field => field.id === 'phoneNumber')?.value || '');

    if (model.isEmailAndPhoneMissing() && !emailAddressProvided && !phoneNumberProvided && model.canToggleEmailPhone) {
      fieldsToSubmit.push(formState.emailAddress);
      fieldsToSubmit.push(formState.phoneNumber);
    }

    const origin = owner.generation;
    const isCurrent = () => canRun() && owner.generation === origin;
    const params = buildRequest(fieldsToSubmit);
    latest.current.card.setError(undefined);
    const pending = Promise.resolve()
      .then(() => {
        if (isCurrent()) {
          return model.submit(params, isCurrent);
        }
        return;
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, fieldsToSubmit, latest.current.card.setError);
        }
      })
      .finally(() => {
        if (owner.pending === pending) {
          owner.pending = undefined;
        }
      });
    owner.pending = pending;
    return pending;
  };

  return {
    fields,
    formState,
    error: card.error,
    handleSubmit,
    handleChangeActive,
    canToggleEmailPhone: model.canToggleEmailPhone,
    showOauthProviders: model.hasSignUp && !model.hasVerifiedExternalAccount && model.hasOauthProviders,
    onlyLegalConsentMissing: model.onlyLegalConsentMissing,
    isCombinedFlow: model.isCombinedFlow,
    signInHref: model.hasSignUp && !model.isCombinedFlow ? model.getSignInHref() : '',
    headerTitle: !model.onlyLegalConsentMissing
      ? localizationKeys('signUp.continue.title')
      : localizationKeys('signUp.legalConsent.continue.title'),
    headerSubtitle: !model.onlyLegalConsentMissing
      ? localizationKeys('signUp.continue.subtitle')
      : localizationKeys('signUp.legalConsent.continue.subtitle'),
  };
};
