import React from 'react';

import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import {
  Card,
  CardAlert,
  Footer,
  Header,
  LoadingCard,
  SocialButtonsReversibleContainerWithDivider,
  withCardStateProvider,
} from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useNavigate } from '../../hooks';
import type { FormControlState } from '../../utils';
import { buildRequest, handleError, useFormControl } from '../../utils';
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

function _SignUpContinue() {
  const card = useCardState();
  const { navigate } = useNavigate();
  const { displayConfig, userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const { setActive } = useCoreClerk();
  const { navigateAfterSignUp, signInUrl } = useSignUpContext();
  const signUp = useCoreSignUp();
  const isProgressiveSignUp = userSettings.signUp.progressive;
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive),
  );

  // Redirect to sign-up if there is no persisted sign-up
  if (!signUp.id) {
    void navigate(displayConfig.signUpUrl);
    return <LoadingCard />;
  }

  // TODO: This form should be shared between SignUpStart and SignUpContinue
  const formState = {
    firstName: useFormControl('firstName', '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__firstName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    }),
    lastName: useFormControl('lastName', '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__lastName'),
      placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    }),
    emailAddress: useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
    username: useFormControl('username', '', {
      type: 'text',
      label: localizationKeys('formFieldLabel__username'),
      placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    }),
    phoneNumber: useFormControl('phoneNumber', '', {
      type: 'tel',
      label: localizationKeys('formFieldLabel__phoneNumber'),
      placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    }),
    password: useFormControl('password', '', {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__password'),
      complexity: true,
      strengthMeter: true,
    }),
  } as const;

  const hasEmail = !!formState.emailAddress.value;
  const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status == 'verified';
  const hasVerifiedWeb3 = signUp.verifications?.web3Wallet?.status == 'verified';

  const fields = determineActiveFields({
    attributes,
    hasEmail,
    activeCommIdentifierType,
    signUp,
    isProgressiveSignUp,
  });
  minimizeFieldsForExistingSignup(fields, signUp);

  const oauthOptions = userSettings.authenticatableSocialStrategies;
  const web3Options = userSettings.web3FirstFactors;

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
      fieldsToSubmit.push(formState['emailAddress']);
      fieldsToSubmit.push(formState['phoneNumber']);
    }

    card.setLoading();
    card.setError(undefined);
    return signUp
      .update(buildRequest(fieldsToSubmit))
      .then(res =>
        completeSignUpFlow({
          signUp: res,
          verifyEmailPath: '../verify-email-address',
          verifyPhonePath: '../verify-phone-number',
          handleComplete: () => setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignUp }),
          navigate,
        }),
      )
      .catch(err => handleError(err, fieldsToSubmit, card.setError))
      .finally(() => card.setIdle());
  };

  const canToggleEmailPhone = emailOrPhone(attributes, isProgressiveSignUp);
  const showOauthProviders = !hasVerifiedExternalAccount && oauthOptions.length > 0;
  const showWeb3Providers = !hasVerifiedWeb3 && web3Options.length > 0;

  return (
    <Flow.Part part='complete'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('signUp.continue.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signUp.continue.subtitle')} />
        </Header.Root>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <SocialButtonsReversibleContainerWithDivider>
            {(showOauthProviders || showWeb3Providers) && (
              <SignUpSocialButtons
                enableOAuthProviders={showOauthProviders}
                enableWeb3Providers={showWeb3Providers}
              />
            )}
            <SignUpForm
              handleSubmit={handleSubmit}
              fields={fields}
              formState={formState}
              canToggleEmailPhone={canToggleEmailPhone}
              handleEmailPhoneToggle={handleChangeActive}
            />
          </SocialButtonsReversibleContainerWithDivider>
        </Flex>
        <Footer.Root>
          <Footer.Action elementId='signUp'>
            <Footer.ActionText localizationKey={localizationKeys('signUp.continue.actionText')} />
            <Footer.ActionLink
              localizationKey={localizationKeys('signUp.continue.actionLink')}
              to={signInUrl}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
}

// TODO: flow / page naming
export const SignUpContinue = withCardStateProvider(_SignUpContinue);
