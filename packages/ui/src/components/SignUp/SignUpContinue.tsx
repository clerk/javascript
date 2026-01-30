import { useClerk } from '@clerk/shared/react';
import React, { useEffect, useMemo } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { SocialButtonsReversibleContainerWithDivider } from '@/ui/elements/ReversibleContainer';
import { handleError } from '@/ui/utils/errorHandler';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { buildRequest, useFormControl } from '@/ui/utils/useFormControl';
import { createUsernameError } from '@/ui/utils/usernameUtils';

import { SignInContext, useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import { SignUpForm } from './SignUpForm';
import type { ActiveIdentifier } from './signUpFormHelpers';
import {
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
} from './signUpFormHelpers';
import { SignUpSocialButtons } from './SignUpSocialButtons';
import { completeSignUpFlow } from './util';

function SignUpContinueInternal() {
  const card = useCardState();
  const clerk = useClerk();
  const { navigate } = useRouter();
  const { displayConfig, userSettings } = useEnvironment();
  const { attributes, usernameSettings } = userSettings;
  const { t, locale } = useLocalizations();
  const {
    afterSignUpUrl,
    signInUrl,
    unsafeMetadata,
    initialValues = {},
    isCombinedFlow: _isCombinedFlow,
    navigateOnSetActive,
  } = useSignUpContext();
  const signUp = useCoreSignUp();
  const isWithinSignInContext = !!React.useContext(SignInContext);
  const isCombinedFlow = !!(_isCombinedFlow && !!isWithinSignInContext);
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive),
  );
  const ctx = useSignUpContext();

  // TODO: This form should be shared between SignUpStart and SignUpContinue
  const formState = {
    firstName: useFormControl('firstName', initialValues.firstName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', initialValues.lastName || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', initialValues.emailAddress || signUp.emailAddress || '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', initialValues.username || '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
      transformer: value => value.trim(),
      buildErrorMessage: errors => createUsernameError(errors, { t, locale, usernameSettings }),
    }),
    phoneNumber: useFormControl('phoneNumber', initialValues.phoneNumber || '', {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__password'),
      validatePassword: true,
    }),
    legalAccepted: useFormControl('legalAccepted', '', {
      type: 'checkbox',
      label: '',
      defaultChecked: false,
      isRequired: userSettings.signUp.legal_consent_enabled || false,
    }),
  } as const;

  const onlyLegalConsentMissing = useMemo(
    () =>
      signUp.missingFields &&
      signUp.missingFields.length === 1 &&
      signUp.missingFields[0] === 'legal_accepted' &&
      signUp.unverifiedFields &&
      signUp.unverifiedFields.length === 0,
    [signUp.missingFields, signUp.unverifiedFields],
  );

  useEffect(() => {
    // Redirect to sign-up if there is no persisted sign-up
    if (!signUp.id && clerk.__internal_setActiveInProgress !== true) {
      void navigate(displayConfig.signUpUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!signUp.id) {
    return <LoadingCard />;
  }

  const hasEmail = !!formState.emailAddress.value;
  const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status == 'verified';

  const fields = determineActiveFields({
    attributes,
    hasEmail,
    activeCommIdentifierType,
    signUp,
    isProgressiveSignUp,
    legalConsentRequired: userSettings.signUp.legal_consent_enabled,
  });
  minimizeFieldsForExistingSignup(fields, signUp);

  const oauthOptions = userSettings.authenticatableSocialStrategies;

  const handleChangeActive = (type: ActiveIdentifier) => {
    if (!emailOrPhone(attributes, isProgressiveSignUp)) {
      return;
    }
    setActiveCommIdentifierType(type);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    type FormStateKey = keyof typeof formState;
    const fieldsToSubmit = Object.entries(fields).reduce(
      (acc, [k, v]) => [...acc, ...(v && formState[k as FormStateKey] ? [formState[k as FormStateKey]] : [])],
      [] as Array<FormControlState>,
    );

    if (unsafeMetadata) {
      fieldsToSubmit.push({ id: 'unsafeMetadata', value: unsafeMetadata } as any);
    }

    // Add both email & phone to the submitted fields to trigger and render an error for both respective inputs in
    // case all the below requirements are met:
    // 1. Sign up contains both in the missing fields
    // 2. The instance settings has both email & phone as optional (emailOrPhone)
    // 3. Neither of them is provided
    const emailAddressProvided = !!(fieldsToSubmit.find(f => f.id === 'emailAddress')?.value || '');
    const phoneNumberProvided = !!(fieldsToSubmit.find(f => f.id === 'phoneNumber')?.value || '');
    const emailOrPhoneMissing =
      signUp.missingFields.includes('email_address') && signUp.missingFields.includes('phone_number');

    if (
      emailOrPhoneMissing &&
      !emailAddressProvided &&
      !phoneNumberProvided &&
      emailOrPhone(attributes, isProgressiveSignUp)
    ) {
      fieldsToSubmit.push(formState.emailAddress);
      fieldsToSubmit.push(formState.phoneNumber);
    }

    card.setLoading();
    card.setError(undefined);

    return signUp
      .update(buildRequest(fieldsToSubmit))
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: './verify-email-address',
          verifyPhonePath: './verify-phone-number',
          handleComplete: () =>
            clerk.setActive({
              session: res.createdSessionId,
              navigate: async ({ session, decorateUrl }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
              },
            }),
          navigate,
          oidcPrompt: ctx.oidcPrompt,
        }),
      )
      .catch(err => handleError(err, fieldsToSubmit, card.setError))
      .finally(() => card.setIdle());
  };

  const canToggleEmailPhone = emailOrPhone(attributes, isProgressiveSignUp);
  const showOauthProviders = !hasVerifiedExternalAccount && oauthOptions.length > 0;

  const headerTitle = !onlyLegalConsentMissing
    ? localizationKeys('signUp.continue.title')
    : localizationKeys('signUp.legalConsent.continue.title');

  const headerSubtitle = !onlyLegalConsentMissing
    ? localizationKeys('signUp.continue.subtitle')
    : localizationKeys('signUp.legalConsent.continue.subtitle');

  return (
    <Flow.Part part='complete'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={headerTitle} />
            <Header.Subtitle localizationKey={headerSubtitle} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={8}
          >
            <SocialButtonsReversibleContainerWithDivider>
              {showOauthProviders && !onlyLegalConsentMissing && (
                <SignUpSocialButtons
                  enableOAuthProviders={showOauthProviders}
                  enableWeb3Providers={false}
                  enableAlternativePhoneCodeProviders={false}
                  continueSignUp
                />
              )}
              <SignUpForm
                handleSubmit={handleSubmit}
                fields={fields}
                formState={formState}
                onlyLegalAcceptedMissing={onlyLegalConsentMissing}
                canToggleEmailPhone={canToggleEmailPhone}
                handleEmailPhoneToggle={handleChangeActive}
              />
            </SocialButtonsReversibleContainerWithDivider>
          </Flex>
        </Card.Content>

        <Card.Footer>
          {!isCombinedFlow ? (
            <Card.Action elementId='signUp'>
              <Card.ActionText localizationKey={localizationKeys('signUp.continue.actionText')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signUp.continue.actionLink')}
                to={isCombinedFlow ? '../../' : clerk.buildUrlWithAuth(signInUrl)}
              />
            </Card.Action>
          ) : null}
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
}

// TODO: flow / page naming
export const SignUpContinue = withCardStateProvider(SignUpContinueInternal);
