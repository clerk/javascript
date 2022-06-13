import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import {
  ActiveIdentifier,
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
  showFormFields,
} from '../../ui/signUp/signUpFormHelpers';
import { completeSignUpFlow } from '../../ui/signUp/util';
import { descriptors, Flex } from '../customizables';
import { CardAlert, FlowCard, Footer, Header, LoadingCard, withFlowCardContext } from '../elements';
import { useCardState } from '../elements/contexts';
import { buildRequest, FormControlStateLike, handleError, useFormControl } from '../utils';
import { SignUpForm } from './SignUpForm';
import { SignUpSocialButtons } from './SignUpSocialButtons';

function _SignUpContinue() {
  const card = useCardState();
  const { navigate } = useNavigate();
  const { displayConfig, userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const { setActive } = useCoreClerk();
  const { navigateAfterSignUp } = useSignUpContext();
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

  const formState = {
    firstName: useFormControl('first_name', '', { type: 'text', label: 'First name' }),
    lastName: useFormControl('last_name', '', { type: 'text', label: 'Last name' }),
    emailAddress: useFormControl('email_address', '', { type: 'email', label: 'Email address' }),
    username: useFormControl('username', '', { type: 'text', label: 'Username' }),
    phoneNumber: useFormControl('phone_number', '', { type: 'tel', label: 'Phone number' }),
    password: useFormControl('password', '', { type: 'password', label: 'Password' }),
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

  const oauthOptions = userSettings.socialProviderStrategies;
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
      [] as Array<FormControlStateLike>,
    );

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
    <FlowCard.OuterContainer>
      <FlowCard.Content>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          {/* TODO: copy? */}
          <Header.Title>Fill in missing fields</Header.Title>
          <Header.Subtitle>to continue to {displayConfig.applicationName}</Header.Subtitle>
        </Header.Root>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
          sx={theme => ({ marginTop: theme.space.$8 })}
        >
          {showOauthProviders && <SignUpSocialButtons />}
          {/*TODO web3 */}
          {showFormFields(userSettings) && (
            <SignUpForm
              handleSubmit={handleSubmit}
              fields={fields}
              formState={formState}
              canToggleEmailPhone={canToggleEmailPhone}
              handleEmailPhoneToggle={handleChangeActive}
            />
          )}
        </Flex>
        <Footer.Root>
          <Footer.Action>
            <Footer.ActionText>Have an account?</Footer.ActionText>
            <Footer.ActionLink
              isExternal
              href={displayConfig.signInUrl}
            >
              Sign in
            </Footer.ActionLink>
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </FlowCard.Content>
    </FlowCard.OuterContainer>
  );
}

// TODO: flow / page naming
export const SignUpContinue = withRedirectToHome(
  withFlowCardContext(_SignUpContinue, { flow: 'signUp', page: 'completeFlow' }),
);
