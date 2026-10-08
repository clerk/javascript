import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { PhoneCodeChannel, PhoneCodeChannelData } from '@clerk/shared/types';
import type React from 'react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { actionBlockedDetailsFrom } from '@/ui/utils/actionBlocked';
import { handleError } from '@/ui/utils/errorHandler';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { buildRequest, useFormControl } from '@/ui/utils/useFormControl';

import { localizationKeys } from '../../customizables';
import type { SignUpStartData } from './sign-up-start.types';
import type { ActiveIdentifier } from './signUpFormHelpers';

type State = {
  activeCommIdentifierType: ActiveIdentifier;
  alternativePhoneCodeProvider: PhoneCodeChannelData | null;
  missingRequirementsWithTicket: boolean;
  captchaIsInteractive: boolean;
};

type Event =
  | { type: 'chooseIdentifier'; identifier: ActiveIdentifier }
  | { type: 'choosePhoneProvider'; provider: PhoneCodeChannelData }
  | { type: 'clearPhoneProvider' }
  | { type: 'ticketMissingRequirements' }
  | { type: 'captchaInteractive'; interactive: boolean };

const transition = (state: State, event: Event): State => {
  switch (event.type) {
    case 'chooseIdentifier':
      return { ...state, activeCommIdentifierType: event.identifier };
    case 'choosePhoneProvider':
      return { ...state, alternativePhoneCodeProvider: event.provider };
    case 'clearPhoneProvider':
      return { ...state, alternativePhoneCodeProvider: null };
    case 'ticketMissingRequirements':
      return { ...state, missingRequirementsWithTicket: true };
    case 'captchaInteractive':
      return { ...state, captchaIsInteractive: event.interactive };
  }
};

export const useSignUpStartController = (model: SignUpStartData) => {
  const card = useCardState();
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const releaseTicket = useRef<() => void>();
  const releaseOAuth = useRef<() => void>();
  const submitted = useRef<Promise<void>>();
  const attemptedTicket = useRef(false);
  const clearedOAuthError = useRef(false);
  const isCurrent = useCallback(() => mounted.current && latest.current.model.canRun(), []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      releaseTicket.current?.();
      releaseTicket.current = undefined;
      releaseOAuth.current?.();
      releaseOAuth.current = undefined;
    };
  }, []);
  const [state, send] = useReducer(
    transition,
    undefined,
    (): State => ({
      activeCommIdentifierType: model.getInitialActiveIdentifier(),
      alternativePhoneCodeProvider: null,
      missingRequirementsWithTicket: false,
      captchaIsInteractive: false,
    }),
  );

  const formState = {
    firstName: useFormControl('firstName', model.initialValues.firstName, {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', model.initialValues.lastName, {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', model.initialValues.emailAddress, {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', model.initialValues.username, {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
      transformer: value => value.trim(),
      buildErrorMessage: model.buildUsernameError,
    }),
    phoneNumber: useFormControl('phoneNumber', model.initialValues.phoneNumber, {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    legalAccepted: useFormControl('legalAccepted', '', {
      type: 'checkbox',
      label: '',
      defaultChecked: false,
      isRequired: model.legalConsentRequired,
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__signUpPassword'),
      validatePassword: true,
      buildErrorMessage: model.buildPasswordError,
    }),
    ticket: useFormControl('ticket', model.getTicket() || ''),
  } as const;

  const hasTicket = !!formState.ticket.value;
  const hasExistingSignUpWithTicket = model.hasExistingSignUpWithTicket();
  const fields = model.getFields(
    state.activeCommIdentifierType,
    hasTicket || hasExistingSignUpWithTicket,
    !!formState.emailAddress.value,
  );

  const ticketValue = formState.ticket.value;
  const setEmail = formState.emailAddress.setValue;
  const setTicket = formState.ticket.setValue;
  useEffect(() => {
    if (!ticketValue || attemptedTicket.current) {
      return;
    }
    let active = true;
    queueMicrotask(() => {
      if (!active || !isCurrent() || attemptedTicket.current) {
        return;
      }
      const release = latest.current.card.beginRequest();
      if (!release) {
        return;
      }
      attemptedTicket.current = true;
      releaseTicket.current = release;
      setIsLoading(true);
      const run = async () => {
        try {
          const ticket = await latest.current.model.createTicket(ticketValue);
          if (!ticket || !isCurrent()) {
            return;
          }
          setEmail(ticket.emailAddress);
          if (ticket.hasMissingRequirements) {
            send({ type: 'ticketMissingRequirements' });
          }
          await ticket.complete();
        } catch (error) {
          if (isCurrent()) {
            setTicket('');
            handleError(error as Error, [], latest.current.card.setError);
          }
        } finally {
          if (
            releaseTicket.current === release &&
            !(isCurrent() && latest.current.model.isRedirectingToSSOProvider())
          ) {
            releaseTicket.current = undefined;
            release();
            if (isCurrent()) {
              setIsLoading(false);
            }
          }
        }
      };
      void run();
    });
    return () => {
      active = false;
    };
  }, [ticketValue, isCurrent, card.isLoading, setEmail, setTicket]);

  useEffect(() => {
    let active = true;
    async function handleOauthError() {
      if (!active || !isCurrent() || clearedOAuthError.current) {
        return;
      }
      clearedOAuthError.current = true;
      const error = latest.current.model.getOAuthError();

      if (error) {
        switch (error.code) {
          case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
          case ERROR_CODES.OAUTH_ACCESS_DENIED:
          case ERROR_CODES.NOT_ALLOWED_ACCESS:
          case ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING:
          case ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML:
          case ERROR_CODES.USER_LOCKED:
          case ERROR_CODES.ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING:
          case ERROR_CODES.ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH:
          case ERROR_CODES.ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH:
          case ERROR_CODES.SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH:
          case ERROR_CODES.ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO:
          case ERROR_CODES.CAPTCHA_INVALID:
          case ERROR_CODES.FRAUD_DEVICE_BLOCKED:
          case ERROR_CODES.FRAUD_ACTION_BLOCKED:
          case ERROR_CODES.SIGNUP_RATE_LIMIT_EXCEEDED:
          case ERROR_CODES.USER_BANNED:
          case ERROR_CODES.USER_DEACTIVATED:
            latest.current.card.setError(error);
            break;
          default:
            // Error from server may be too much information for the end user, so set a generic error
            latest.current.card.setError(
              'Unable to complete action at this time. If the problem persists please contact support.',
            );
        }

        if (!ticketValue) {
          const release = latest.current.card.beginRequest();
          if (!release) {
            clearedOAuthError.current = false;
            return;
          }
          releaseOAuth.current = release;
          try {
            await latest.current.model.resetOAuthAttempt();
          } catch (failure) {
            if (isCurrent()) {
              handleError(failure as Error, [], latest.current.card.setError);
            }
          } finally {
            if (releaseOAuth.current === release) {
              releaseOAuth.current = undefined;
              release();
            }
          }
        }
      }
    }

    queueMicrotask(() => {
      void handleOauthError();
    });
    return () => {
      active = false;
    };
  }, [isCurrent, ticketValue, card.isLoading]);

  const handleChangeActive = (type: ActiveIdentifier) => {
    if (!isCurrent() || !model.canToggleEmailPhone) {
      return;
    }
    send({ type: 'chooseIdentifier', identifier: type });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCurrent() || releaseTicket.current || releaseOAuth.current) {
      return Promise.resolve();
    }
    if (submitted.current) {
      return submitted.current;
    }

    type FormStateKey = keyof typeof formState;
    const fieldsToSubmit = Object.entries(fields).reduce((acc, [key, value]) => {
      acc.push(...(value && formState[key as FormStateKey] ? [formState[key as FormStateKey]] : []));
      return acc;
    }, [] as Array<FormControlState>);

    // In case of emailOrPhone (both email & phone are optional) and neither of them is provided,
    // add both to the submitted fields to trigger and render an error for both respective inputs
    const emailAddressProvided = !!(fieldsToSubmit.find(field => field.id === 'emailAddress')?.value || '');
    const phoneNumberProvided = !!(fieldsToSubmit.find(field => field.id === 'phoneNumber')?.value || '');

    if (!emailAddressProvided && !phoneNumberProvided && model.canToggleEmailPhone) {
      fieldsToSubmit.push(formState.emailAddress);
      fieldsToSubmit.push(formState.phoneNumber);
    }

    card.setError(undefined);

    const request = model
      .submit(buildRequest(fieldsToSubmit), {
        useTicket: Boolean(fields.ticket || hasExistingSignUpWithTicket),
        channel: state.alternativePhoneCodeProvider?.channel,
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, fieldsToSubmit, latest.current.card.setError);
        }
      })
      .finally(() => {
        if (submitted.current === request) {
          submitted.current = undefined;
        }
      });
    submitted.current = request;
    return request;
  };

  const visibleFields = isLoading
    ? []
    : Object.entries(fields).filter(([key, opts]) => {
        // In case both email & phone are optional (emailOrPhone case), always show the active identifier
        if ((key === 'emailAddress' || key === 'phoneNumber') && model.canToggleEmailPhone) {
          return !!opts;
        }
        return model.showOptionalFields || opts?.required;
      });
  const shouldShowForm = model.showFormFields && visibleFields.length > 0;

  const showOauthProviders =
    (!(hasTicket || hasExistingSignUpWithTicket) || state.missingRequirementsWithTicket) && model.hasOauthProviders;
  const showWeb3Providers = !(hasTicket || hasExistingSignUpWithTicket) && model.hasWeb3Providers;
  const showAlternativePhoneCodeProviders =
    !(hasTicket || hasExistingSignUpWithTicket) && model.hasAlternativePhoneCodeProviders;

  const onAlternativePhoneCodeProviderClick = (channel: PhoneCodeChannel) => {
    if (!isCurrent()) {
      return;
    }
    const provider = model.getAlternativePhoneCodeProvider(channel);
    if (provider) {
      send({ type: 'choosePhoneProvider', provider });
    } else {
      send({ type: 'clearPhoneProvider' });
    }
  };

  const blockedDetails = isLoading ? null : actionBlockedDetailsFrom(card.rawError);
  const isRestricted = !model.isPublicMode && !(hasTicket || hasExistingSignUpWithTicket);

  return {
    isLoading: isLoading,
    blockedDetails,
    isRestricted,
    alternativePhoneCodeProvider: state.alternativePhoneCodeProvider,
    captchaIsInteractive: state.captchaIsInteractive,
    onCaptchaInteractiveChange: (interactive: boolean) => send({ type: 'captchaInteractive', interactive }),
    error: card.error,
    fields,
    formState,
    handleSubmit,
    handleChangeActive,
    canToggleEmailPhone: model.canToggleEmailPhone,
    shouldShowForm,
    showOauthProviders,
    showWeb3Providers,
    showAlternativePhoneCodeProviders,
    onAlternativePhoneCodeProviderClick,
    onAlternativePhoneCodeUseAnotherMethod: () => send({ type: 'clearPhoneProvider' }),
    missingRequirementsWithTicket: state.missingRequirementsWithTicket,
    isCombinedFlow: model.isCombinedFlow,
    signInHref:
      !isLoading && !blockedDetails && !isRestricted && !state.alternativePhoneCodeProvider && !model.isCombinedFlow
        ? model.getSignInHref()
        : '',
  };
};
