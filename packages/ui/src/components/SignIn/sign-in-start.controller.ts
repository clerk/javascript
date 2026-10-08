import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import type { PhoneCodeChannel, PhoneCodeChannelData } from '@clerk/shared/types';
import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { actionBlockedDetailsFrom } from '@/ui/utils/actionBlocked';
import { handleError } from '@/ui/utils/errorHandler';
import { isMobileDevice } from '@/ui/utils/isMobileDevice';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { SignInStartIdentifier } from '../../common';
import { getIdentifierControlDisplayValues } from '../../common';
import { localizationKeys } from '../../customizables';
import { useSignInPasskeyController } from './sign-in-passkey.controller';
import type { SignInStartField, SignInStartModel } from './sign-in-start.types';

export const useSignInStartController = (model: SignInStartModel) => {
  const card = useCardState();
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const mounted = useRef(true);
  const ticketRequest = useRef<{ version: number; release: () => void }>();
  const fieldRequest = useRef<{ version: number; release?: () => void }>();
  const attemptedTicket = useRef<number>();
  const clearedOAuthError = useRef<number>();
  const recover = useRef<(error: unknown) => Promise<void>>();
  const [ticketLoadingVersion, setTicketLoadingVersion] = useState<number>();
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && latest.current.model.canRun(),
    [version],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const request = ticketRequest.current;
      if (request?.version === version) {
        ticketRequest.current = undefined;
        request.release();
      }
      const submission = fieldRequest.current;
      if (submission?.version === version) {
        fieldRequest.current = undefined;
        submission.release?.();
      }
    };
  }, [version]);
  const { totalEnabledAuthMethods, identifierAttributes, isWebSupported, organizationTicket, clerkStatus } = model;
  const { authenticateWithPasskey, isWebAuthnAutofillSupported } = useSignInPasskeyController({
    requestKey: model.passkeyRequestKey,
    canRun: model.canAuthenticateWithPasskey,
    authenticateWithPasskey: model.authenticateWithPasskey,
    autofillAllowed: model.passkeyAutofillAllowed,
    checkAutofillSupport: model.checkPasskeyAutofillSupport,
  });
  const { isCombinedFlow } = model;

  const onlyPhoneNumberInitialValueExists =
    !!model.initialValues?.phoneNumber && !(model.initialValues.emailAddress || model.initialValues.username);
  const shouldStartWithPhoneNumberIdentifier =
    onlyPhoneNumberInitialValueExists && identifierAttributes.includes('phone_number');
  const [identifierAttribute, setIdentifierAttribute] = useState<SignInStartIdentifier>(
    shouldStartWithPhoneNumberIdentifier ? 'phone_number' : identifierAttributes[0] || '',
  );
  const [hasSwitchedByAutofill, setHasSwitchedByAutofill] = useState(false);

  const standardFormAttributes = model.standardFormAttributes;
  const passwordBasedInstance = model.passwordBasedInstance;
  const { currentIdentifier, nextIdentifier } = getIdentifierControlDisplayValues(
    identifierAttributes,
    identifierAttribute,
  );
  const instantPasswordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
  });

  const [alternativePhoneCodeProvider, setAlternativePhoneCodeProvider] = useState<PhoneCodeChannelData | null>(null);

  const showAlternativePhoneCodeProviders = model.showAlternativePhoneCodeProviders;

  const onAlternativePhoneCodeUseAnotherMethod = () => {
    setAlternativePhoneCodeProvider(null);
  };
  const onAlternativePhoneCodeProviderClick = (phoneCodeChannel: PhoneCodeChannel) => {
    const provider: PhoneCodeChannelData | null = getAlternativePhoneCodeProviderData(phoneCodeChannel) || null;
    setAlternativePhoneCodeProvider(provider);
  };

  const { emailAddress, username, phoneNumber } = model.initialValues || {};
  const initialValues: Record<SignInStartIdentifier, string | undefined> = useMemo(
    () => ({
      email_address: emailAddress,
      email_address_username: emailAddress || username,
      username,
      phone_number: phoneNumber,
    }),
    [emailAddress, username, phoneNumber],
  );

  const hasSocialOrWeb3Buttons = model.hasSocialOrWeb3Buttons;
  const [shouldAutofocus, setShouldAutofocus] = useState(!isMobileDevice() && !hasSocialOrWeb3Buttons);
  // When the captcha escalates to an interactive challenge, spotlight it by collapsing/inerting the
  // rest of the card (see the descriptors.main column below).
  const [captchaIsInteractive, setCaptchaIsInteractive] = useState(false);
  const textIdentifierField = useFormControl('identifier', initialValues[identifierAttribute] || '', {
    ...currentIdentifier,
    isRequired: true,
    transformer: value => value.trim(),
  });

  const phoneIdentifierField = useFormControl('identifier', initialValues['phone_number'] || '', {
    ...currentIdentifier,
    type: 'tel',
    isRequired: true,
  });

  const identifierField =
    alternativePhoneCodeProvider || identifierAttribute === 'phone_number' ? phoneIdentifierField : textIdentifierField;

  const switchToNextIdentifier = () => {
    setIdentifierAttribute(
      i => identifierAttributes[(identifierAttributes.indexOf(i) + 1) % identifierAttributes.length],
    );
    setShouldAutofocus(true);
    setHasSwitchedByAutofill(false);
  };

  // switch to the phone input (if available) if a "+" is entered
  // (either by the browser or the user)
  // this does not work in chrome as it does not fire the change event and the value is
  // not available via js
  useLayoutEffect(() => {
    if (
      identifierField.value.startsWith('+') &&
      identifierAttributes.includes('phone_number') &&
      !alternativePhoneCodeProvider &&
      identifierAttribute !== 'phone_number' &&
      !hasSwitchedByAutofill
    ) {
      textIdentifierField.setValue(initialValues[identifierAttribute] || '');
      phoneIdentifierField.setValue(identifierField.value);
      setIdentifierAttribute('phone_number');
      setShouldAutofocus(true);
      // do not switch automatically on subsequent autofills
      // by the browser to avoid a switch loop
      setHasSwitchedByAutofill(true);
    }
  }, [
    identifierField.value,
    identifierAttributes,
    identifierAttribute,
    hasSwitchedByAutofill,
    alternativePhoneCodeProvider,
    textIdentifierField,
    phoneIdentifierField,
    initialValues,
  ]);

  useEffect(() => {
    if (!organizationTicket || attemptedTicket.current === version) {
      return;
    }
    let active = true;
    queueMicrotask(() => {
      if (!active || !isCurrent() || attemptedTicket.current === version) {
        return;
      }
      if (clerkStatus === 'sign_up') {
        attemptedTicket.current = version;
        const paramsToForward = new URLSearchParams({ __clerk_ticket: organizationTicket });
        void latest.current.model.navigateToTicketSignUp(paramsToForward).catch(async error => {
          if (isCurrent()) {
            await recover.current?.(error);
          }
        });
        return;
      }
      const release = latest.current.card.beginRequest();
      if (!release) {
        return;
      }
      attemptedTicket.current = version;
      const request = { version, release };
      ticketRequest.current = request;
      setTicketLoadingVersion(version);
      const run = async () => {
        try {
          await latest.current.model.createTicketSignIn(organizationTicket);
        } catch (error) {
          if (isCurrent() && ticketRequest.current === request) {
            await recover.current?.(error);
          }
        } finally {
          if (
            ticketRequest.current === request &&
            !(isCurrent() && latest.current.model.isRedirectingToSSOProvider())
          ) {
            ticketRequest.current = undefined;
            release();
            if (isCurrent()) {
              setTicketLoadingVersion(undefined);
            }
          }
        }
      };
      void run();
    });
    return () => {
      active = false;
    };
  }, [organizationTicket, clerkStatus, version, isCurrent, card.isLoading]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || !isCurrent() || clearedOAuthError.current === version) {
        return;
      }
      clearedOAuthError.current = version;
      const error = latest.current.model.getFirstFactorError();
      if (!error) {
        return;
      }
      if (error.kind === 'api_error') {
        latest.current.card.setError(error.error);
      } else {
        latest.current.card.setError(
          'Unable to complete action at this time. If the problem persists please contact support.',
        );
      }
      if (!organizationTicket) {
        void latest.current.model.clearFirstFactorError().catch(failure => {
          if (isCurrent()) {
            handleError(failure as Error, [], latest.current.card.setError);
          }
        });
      }
    });
    return () => {
      active = false;
    };
  }, [version, isCurrent, organizationTicket]);

  const signInWithFields = async (
    fields: Array<FormControlState<string>>,
    options?: { resetPasswordIntent?: boolean },
    release?: () => void,
  ) => {
    if (!isCurrent() || fieldRequest.current || ticketRequest.current) {
      release?.();
      return;
    }
    const request = { version, release };
    fieldRequest.current = request;
    const values = fields.map(({ id, name, value, checked, type }) => ({ id, name, value, checked, type }));
    const identifier = values.find(field => field.id === identifierField.id) || {
      id: identifierField.id,
      type: identifierField.type,
      value: identifierField.value,
    };
    const channel = alternativePhoneCodeProvider?.channel;
    const submit = async (submittedFields: SignInStartField[], mayRetry: boolean): Promise<void> => {
      if (!isCurrent()) {
        return;
      }
      try {
        await model.submit(submittedFields, { ...options, channel });
      } catch (error) {
        await attemptToRecoverFromSignInError(
          error,
          identifier,
          channel,
          mayRetry ? () => submit([identifier], false) : undefined,
        );
      }
    };
    try {
      await submit(
        values,
        values.some(field => field.name === 'password' && !!field.value),
      );
    } finally {
      if (fieldRequest.current === request) {
        fieldRequest.current = undefined;
        release?.();
      }
    }
  };

  const attemptToRecoverFromSignInError = async (
    error: unknown,
    identifier: Pick<SignInStartField, 'type' | 'value'> = {
      type: identifierField.type,
      value: identifierField.value,
    },
    channel = alternativePhoneCodeProvider?.channel,
    retry?: () => Promise<void>,
  ) => {
    if (!isCurrent()) {
      return;
    }
    try {
      const recovery = await model.recoverSignInError(error, identifier, channel);
      if (!isCurrent()) {
        return;
      }
      if (recovery === 'retry_identifier' && retry) {
        await retry();
      } else if (recovery === 'unhandled' || recovery === 'retry_identifier') {
        handleError(error as Error, [identifierField, instantPasswordField], card.setError);
      }
    } catch (recoveryError) {
      if (isCurrent()) {
        handleError(recoveryError as Error, [identifierField, instantPasswordField], card.setError);
      }
    }
  };

  recover.current = attemptToRecoverFromSignInError;

  const handleFirstPartySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return signInWithFields(
      alternativePhoneCodeProvider ? [phoneIdentifierField] : [identifierField, instantPasswordField],
    );
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCurrent() || fieldRequest.current || ticketRequest.current) {
      return;
    }
    // Surface the same native required-field validation as the Continue button
    // when the identifier is missing
    const form = e.currentTarget.closest('form');
    if (form && !form.reportValidity()) {
      return;
    }
    const release = card.beginRequest();
    if (!release) {
      return;
    }
    return signInWithFields([identifierField], { resetPasswordIntent: true }, release);
  };

  const DynamicField = useMemo(() => {
    const components = {
      tel: Form.PhoneInput,
      password: Form.PasswordInput,
      text: Form.PlainInput,
      email: Form.PlainInput,
    };

    return components[identifierField.type as keyof typeof components];
  }, [identifierField.type]);

  if (ticketLoadingVersion === version || clerkStatus === 'sign_up') {
    return { kind: 'loading' as const };
  }

  // @ts-expect-error `action` is not typed
  const { action, validLastAuthenticationStrategies, ...identifierFieldProps } = identifierField.props;
  const lastAuthenticationStrategy = model.lastAuthenticationStrategy;
  const isIdentifierLastAuthenticationStrategy =
    lastAuthenticationStrategy && totalEnabledAuthMethods > 1
      ? validLastAuthenticationStrategies?.has(lastAuthenticationStrategy)
      : false;

  const blockedDetails = actionBlockedDetailsFrom(card.rawError);
  if (blockedDetails) {
    return { kind: 'blocked' as const, blockedDetails };
  }

  return {
    kind: 'form' as const,
    formKey: model.requestKey,
    cardError: card.error,
    alternativePhoneCodeProvider,
    captchaIsInteractive,
    setCaptchaIsInteractive,
    hasSocialOrWeb3Buttons,
    showAlternativePhoneCodeProviders,
    onAlternativePhoneCodeProviderClick,
    standardFormAttributes,
    handleFirstPartySubmit,
    identifierField,
    DynamicField,
    nextIdentifier,
    switchToNextIdentifier,
    identifierFieldProps,
    shouldAutofocus,
    isWebAuthnAutofillSupported,
    isIdentifierLastAuthenticationStrategy,
    passwordBasedInstance,
    instantPasswordField,
    handleForgotPasswordClick,
    signUpMode: model.signUpMode,
    passkeyEnabled: model.passkeyEnabled,
    showPasskeySignInButton: model.showPasskeySignInButton,
    isWebSupported,
    authenticateWithPasskey,
    isCombinedFlow,
    signUpHref:
      !alternativePhoneCodeProvider && model.signUpMode === SIGN_UP_MODES.PUBLIC && !isCombinedFlow
        ? model.buildUrlWithAuth(model.signUpUrl)
        : '',
    waitlistHref:
      !alternativePhoneCodeProvider && model.signUpMode === SIGN_UP_MODES.WAITLIST
        ? model.buildUrlWithAuth(model.waitlistUrl)
        : '',
    phoneIdentifierField,
    onAlternativePhoneCodeUseAnotherMethod,
  };
};
