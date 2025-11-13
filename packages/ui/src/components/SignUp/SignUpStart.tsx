import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES, SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import { getClerkQueryParam, removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import type { PhoneCodeChannel, PhoneCodeChannelData, SignUpResource } from '@clerk/shared/types';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { SocialButtonsReversibleContainerWithDivider } from '@/ui/elements/ReversibleContainer';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { buildRequest, useFormControl } from '@/ui/utils/useFormControl';
import { createUsernameError } from '@/ui/utils/usernameUtils';

import { withRedirectToAfterSignUp, withRedirectToSignUpTask } from '../../common';
import { SignInContext, useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys, useAppearance, useLocalizations } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import { useLoadingStatus } from '../../hooks';
import { useRouter } from '../../router';
import { getPreferredAlternativePhoneChannel } from '../SignIn/utils';
import { SignUpForm } from './SignUpForm';
import type { ActiveIdentifier } from './signUpFormHelpers';
import { determineActiveFields, emailOrPhone, getInitialActiveIdentifier, showFormFields } from './signUpFormHelpers';
import { SignUpRestrictedAccess } from './SignUpRestrictedAccess';
import { SignUpSocialButtons } from './SignUpSocialButtons';
import { SignUpStartAlternativePhoneCodePhoneNumberCard } from './SignUpStartAlternativePhoneCodePhoneNumberCard';
import { completeSignUpFlow } from './util';

function SignUpStartInternal(): JSX.Element {
  const card = useCardState();
  const clerk = useClerk();
  const status = useLoadingStatus();
  const signUp = useCoreSignUp();
  const { showOptionalFields } = useAppearance().parsedLayout;
  const { userSettings, authConfig } = useEnvironment();
  const { navigate } = useRouter();
  const { attributes } = userSettings;
  const { setActive } = useClerk();
  const ctx = useSignUpContext();
  const isWithinSignInContext = !!React.useContext(SignInContext);
  const { afterSignUpUrl, signInUrl, unsafeMetadata, navigateOnSetActive } = ctx;
  const isCombinedFlow = !!(ctx.isCombinedFlow && !!isWithinSignInContext);
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(() =>
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive, {
      phoneNumber: ctx.initialValues?.phoneNumber === null ? undefined : ctx.initialValues?.phoneNumber,
      emailAddress: ctx.initialValues?.emailAddress === null ? undefined : ctx.initialValues?.emailAddress,
      ...(isCombinedFlow
        ? {
            emailAddress: signUp.emailAddress,
            phoneNumber: signUp.phoneNumber,
          }
        : {}),
    }),
  );
  const { t, locale } = useLocalizations();
  const initialValues = ctx.initialValues || {};
  const [alternativePhoneCodeProvider, setAlternativePhoneCodeProvider] = React.useState<PhoneCodeChannelData | null>(
    null,
  );

  const [missingRequirementsWithTicket, setMissingRequirementsWithTicket] = React.useState(false);

  const {
    userSettings: { passwordSettings, usernameSettings },
  } = useEnvironment();

  const { mode } = userSettings.signUp;

  const formState = {
    firstName: useFormControl('firstName', signUp.firstName || initialValues.firstName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', signUp.lastName || initialValues.lastName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', signUp.emailAddress || initialValues.emailAddress || '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', signUp.username || initialValues.username || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
      transformer: value => value.trim(),
      buildErrorMessage: errors => createUsernameError(errors, { t, locale, usernameSettings }),
    }),
    phoneNumber: useFormControl('phoneNumber', signUp.phoneNumber || initialValues.phoneNumber || '', {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    legalAccepted: useFormControl('legalAccepted', '', {
      type: 'checkbox',
      label: '',
      defaultChecked: false,
      isRequired: userSettings.signUp.legal_consent_enabled || false,
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__password'),
      validatePassword: true,
      buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings }),
    }),
    ticket: useFormControl(
      'ticket',
      getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token') || '',
    ),
  } as const;

  const hasTicket = !!formState.ticket.value;
  const hasExistingSignUpWithTicket = !!(
    signUp.id &&
    signUp.status !== null &&
    (getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token'))
  );
  const hasEmail = !!formState.emailAddress.value;
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const isLegalConsentEnabled = userSettings.signUp.legal_consent_enabled;
  const oidcPrompt = ctx.oidcPrompt;

  const fields = determineActiveFields({
    attributes,
    hasTicket: hasTicket || hasExistingSignUpWithTicket,
    hasEmail,
    activeCommIdentifierType,
    isProgressiveSignUp,
    legalConsentRequired: isLegalConsentEnabled,
  });

  const handleTokenFlow = () => {
    if (!formState.ticket.value) {
      return;
    }
    status.setLoading();
    card.setLoading();
    signUp
      .create({ strategy: 'ticket', ticket: formState.ticket.value })
      .then(signUp => {
        formState.emailAddress.setValue(signUp.emailAddress || '');
        // In case we are in a Ticket flow and the sign up is not complete yet, update the state
        // to render properly the SignUp form with other available options to complete it (e.g. OAuth)
        if (signUp.status === 'missing_requirements') {
          setMissingRequirementsWithTicket(true);
        }

        const redirectUrl = ctx.ssoCallbackUrl;
        const redirectUrlComplete = ctx.afterSignUpUrl || '/';

        return completeSignUpFlow({
          signUp,
          redirectUrl,
          redirectUrlComplete,
          verifyEmailPath: 'verify-email-address',
          verifyPhonePath: 'verify-phone-number',
          continuePath: 'continue',
          handleComplete: () => {
            removeClerkQueryParam('__clerk_ticket');
            removeClerkQueryParam('__clerk_invitation_token');
            return setActive({
              session: signUp.createdSessionId,
              navigate: async ({ session }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl });
              },
            });
          },
          navigate,
          oidcPrompt,
        });
      })
      .catch(err => {
        /* Clear ticket values when an error occurs in the initial sign up attempt */
        formState.ticket.setValue('');
        handleError(err, [], card.setError);
      })
      .finally(() => {
        // Keep the card in loading state during SSO redirect to prevent UI flicker
        // This is necessary because there's a brief delay between initiating the SSO flow
        // and the actual redirect to the external Identity Provider
        const isRedirectingToSSOProvider = signUp.missingFields.some(mf => mf === 'saml' || mf === 'enterprise_sso');
        if (isRedirectingToSSOProvider) {
          return;
        }

        status.setIdle();
        card.setIdle();
      });
  };

  React.useLayoutEffect(() => {
    void handleTokenFlow();
  }, []);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signUp.verifications.externalAccount.error;

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
            card.setError(error);
            break;
          default:
            // Error from server may be too much information for the end user, so set a generic error
            card.setError('Unable to complete action at this time. If the problem persists please contact support.');
        }

        // TODO: This is a hack to reset the sign in attempt so that the oauth error
        // does not persist on full page reloads.
        // We will revise this strategy as part of the Clerk DX epic.
        void (await signUp.create({}));
      }
    }

    void handleOauthError();
  }, []);

  const handleChangeActive = (type: ActiveIdentifier) => {
    if (!emailOrPhone(attributes, isProgressiveSignUp)) {
      return;
    }
    setActiveCommIdentifierType(type);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    type FormStateKey = keyof typeof formState;
    const fieldsToSubmit = Object.entries(fields).reduce((acc, [k, v]) => {
      acc.push(...(v && formState[k as FormStateKey] ? [formState[k as FormStateKey]] : []));
      return acc;
    }, [] as Array<FormControlState>);

    if (unsafeMetadata) {
      fieldsToSubmit.push({ id: 'unsafeMetadata', value: unsafeMetadata } as any);
    }

    if (fields.ticket || hasExistingSignUpWithTicket) {
      const noop = () => {};
      // fieldsToSubmit: Constructing a fake fields object for strategy.
      fieldsToSubmit.push({
        id: 'strategy',
        value: 'ticket',
        clearFeedback: noop,
        setValue: noop,
        onChange: noop,
        setError: noop,
      } as any);

      // Get ticket value from query params if it exists
      if (!formState.ticket.value && hasExistingSignUpWithTicket) {
        const ticketValue = getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token');
        if (ticketValue) {
          fieldsToSubmit.push({
            id: 'ticket',
            value: ticketValue,
            clearFeedback: noop,
            setValue: noop,
            onChange: noop,
            setError: noop,
          } as any);
        }
      }
    }

    // If the user has already selected an alternative phone code provider, we use that.
    const preferredAlternativePhoneChannel =
      alternativePhoneCodeProvider?.channel ||
      getPreferredAlternativePhoneChannel(fieldsToSubmit, authConfig.preferredChannels, 'phoneNumber');
    if (preferredAlternativePhoneChannel) {
      // We need to send the alternative phone code provider channel in the sign up request
      // together with the phone_code strategy, in order for FAPI to create a Verification upon this first request.
      const noop = () => {};
      fieldsToSubmit.push({
        id: 'strategy',
        value: 'phone_code',
        clearFeedback: noop,
        setValue: noop,
        onChange: noop,
        setError: noop,
      } as any);
      fieldsToSubmit.push({
        id: 'channel',
        value: preferredAlternativePhoneChannel,
        clearFeedback: noop,
        setValue: noop,
        onChange: noop,
        setError: noop,
      } as any);
    }

    // In case of emailOrPhone (both email & phone are optional) and neither of them is provided,
    // add both to the submitted fields to trigger and render an error for both respective inputs
    const emailAddressProvided = !!(fieldsToSubmit.find(f => f.id === 'emailAddress')?.value || '');
    const phoneNumberProvided = !!(fieldsToSubmit.find(f => f.id === 'phoneNumber')?.value || '');

    if (!emailAddressProvided && !phoneNumberProvided && emailOrPhone(attributes, isProgressiveSignUp)) {
      fieldsToSubmit.push(formState.emailAddress);
      fieldsToSubmit.push(formState.phoneNumber);
    }

    card.setLoading();
    card.setError(undefined);

    const redirectUrl = ctx.ssoCallbackUrl;
    const redirectUrlComplete = ctx.afterSignUpUrl || '/';

    let signUpAttempt: Promise<SignUpResource>;
    if (!fields.ticket && !hasExistingSignUpWithTicket) {
      signUpAttempt = signUp.create(buildRequest(fieldsToSubmit));
    } else {
      signUpAttempt = signUp.upsert(buildRequest(fieldsToSubmit));
    }

    return signUpAttempt
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: 'verify-email-address',
          verifyPhonePath: 'verify-phone-number',
          handleComplete: () =>
            setActive({
              session: res.createdSessionId,
              navigate: async ({ session }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl });
              },
            }),
          navigate,
          redirectUrl,
          redirectUrlComplete,
          oidcPrompt,
        }),
      )
      .catch(err => {
        /**
         * @experimental
         */
        if (
          isClerkAPIResponseError(err) &&
          err.errors?.[0]?.code === 'enterprise_connection_id_is_required_with_multiple_connections'
        ) {
          return navigate('./enterprise-connections');
        }

        return handleError(err, fieldsToSubmit, card.setError);
      })
      .finally(() => card.setIdle());
  };

  if (status.isLoading) {
    return <LoadingCard />;
  }

  const canToggleEmailPhone = emailOrPhone(attributes, isProgressiveSignUp);
  const visibleFields = Object.entries(fields).filter(([_, opts]) => showOptionalFields || opts?.required);
  const shouldShowForm = showFormFields(userSettings) && visibleFields.length > 0;

  const showOauthProviders =
    (!(hasTicket || hasExistingSignUpWithTicket) || missingRequirementsWithTicket) &&
    userSettings.authenticatableSocialStrategies.length > 0;
  const showWeb3Providers = !(hasTicket || hasExistingSignUpWithTicket) && userSettings.web3FirstFactors.length > 0;
  const showAlternativePhoneCodeProviders =
    !(hasTicket || hasExistingSignUpWithTicket) && userSettings.alternativePhoneCodeChannels.length > 0;

  const onAlternativePhoneCodeUseAnotherMethod = () => {
    setAlternativePhoneCodeProvider(null);
  };
  const onAlternativePhoneCodeProviderClick = (phoneCodeChannel: PhoneCodeChannel) => {
    const phoneCodeProvider: PhoneCodeChannelData | null =
      getAlternativePhoneCodeProviderData(phoneCodeChannel) || null;
    setAlternativePhoneCodeProvider(phoneCodeProvider);
  };

  if (mode !== SIGN_UP_MODES.PUBLIC && !(hasTicket || hasExistingSignUpWithTicket)) {
    return <SignUpRestrictedAccess />;
  }

  return (
    <Flow.Part part='start'>
      {!alternativePhoneCodeProvider ? (
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title
                localizationKey={
                  isCombinedFlow
                    ? localizationKeys('signUp.start.titleCombined')
                    : localizationKeys('signUp.start.title')
                }
              />
              <Header.Subtitle
                localizationKey={
                  isCombinedFlow
                    ? localizationKeys('signUp.start.subtitleCombined')
                    : localizationKeys('signUp.start.subtitle')
                }
              />
            </Header.Root>
            <Card.Alert>{card.error}</Card.Alert>
            <Flex
              direction='col'
              elementDescriptor={descriptors.main}
              gap={6}
            >
              <SocialButtonsReversibleContainerWithDivider>
                {(showOauthProviders || showWeb3Providers || showAlternativePhoneCodeProviders) && (
                  <SignUpSocialButtons
                    enableOAuthProviders={showOauthProviders}
                    enableWeb3Providers={showWeb3Providers}
                    enableAlternativePhoneCodeProviders={showAlternativePhoneCodeProviders}
                    onAlternativePhoneCodeProviderClick={onAlternativePhoneCodeProviderClick}
                    continueSignUp={missingRequirementsWithTicket}
                    legalAccepted={Boolean(formState.legalAccepted.checked) || undefined}
                  />
                )}
                {shouldShowForm && (
                  <SignUpForm
                    handleSubmit={handleSubmit}
                    fields={fields}
                    formState={formState}
                    canToggleEmailPhone={canToggleEmailPhone}
                    handleEmailPhoneToggle={handleChangeActive}
                  />
                )}
              </SocialButtonsReversibleContainerWithDivider>
              {!shouldShowForm && <CaptchaElement />}
            </Flex>
          </Card.Content>

          <Card.Footer>
            <Card.Action elementId='signUp'>
              <Card.ActionText localizationKey={localizationKeys('signUp.start.actionText')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signUp.start.actionLink')}
                to={isCombinedFlow ? '../' : clerk.buildUrlWithAuth(signInUrl)}
              />
            </Card.Action>
          </Card.Footer>
        </Card.Root>
      ) : (
        <SignUpStartAlternativePhoneCodePhoneNumberCard
          handleSubmit={handleSubmit}
          fields={fields}
          formState={formState}
          onUseAnotherMethod={onAlternativePhoneCodeUseAnotherMethod}
          phoneCodeProvider={alternativePhoneCodeProvider}
        />
      )}
    </Flow.Part>
  );
}

export const SignUpStart = withRedirectToSignUpTask(
  withRedirectToAfterSignUp(withCardStateProvider(SignUpStartInternal)),
);
