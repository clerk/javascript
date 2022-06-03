import React from 'react';
import type { FieldState } from 'ui/common';
import {
  buildRequest,
  Footer,
  handleError,
  PoweredByClerk,
  Separator,
  useFieldState,
  withRedirectToHome,
} from 'ui/common';
import { Alert } from 'ui/common/alert';
import { Body, Header } from 'ui/common/authForms';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { SignUpForm } from 'ui/signUp/SignUpForm';
import { completeSignUpFlow } from 'ui/signUp/util';

import { SignInLink } from './SignInLink';
import {
  ActiveIdentifier,
  determineActiveFields,
  emailOrPhone,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
  showFormFields,
} from './signUpFormHelpers';
import { SignUpOAuth } from './SignUpOAuth';
import { SignUpWeb3 } from './SignUpWeb3';

function _SignUpContinue(): JSX.Element | null {
  const { navigate } = useNavigate();
  const { displayConfig, userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const { setSession } = useCoreClerk();
  const { navigateAfterSignUp } = useSignUpContext();
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes, userSettings.signUp.progressive),
  );
  const signUp = useCoreSignUp();
  const isProgressiveSignUp = userSettings.signUp.progressive;

  // Redirect to sign-up if there is no persisted sign-up

  if (!signUp.id) {
    void navigate(displayConfig.signUpUrl);
    return null;
  }

  // Pre-populate fields from existing sign-up object

  const formState = {
    firstName: useFieldState('first_name', signUp.firstName || ''),
    lastName: useFieldState('last_name', signUp.lastName || ''),
    emailAddress: useFieldState('email_address', signUp.emailAddress || ''),
    username: useFieldState('username', signUp.username || ''),
    phoneNumber: useFieldState('phone_number', signUp.phoneNumber || ''),
    password: useFieldState('password', ''),
    ticket: useFieldState('ticket', ''),
  } as const;

  type FormStateKey = keyof typeof formState;

  const [error, setError] = React.useState<string | undefined>();

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

  const handleChangeActive = (type: ActiveIdentifier) => (e: React.MouseEvent) => {
    e.preventDefault();

    if (!emailOrPhone(attributes, isProgressiveSignUp)) {
      return;
    }

    setActiveCommIdentifierType(type);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fieldsToSubmit = Object.entries(fields).reduce(
      (acc, [k, v]) => [...acc, ...(v && formState[k as FormStateKey] ? [formState[k as FormStateKey]] : [])],
      [] as Array<FieldState<any>>,
    );

    try {
      setError(undefined);
      const req = buildRequest(fieldsToSubmit);
      const res = await signUp.update(req);

      return completeSignUpFlow({
        signUp: res,
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        handleComplete: () => setSession(res.createdSessionId, navigateAfterSignUp),
        navigate,
      });
    } catch (err) {
      handleError(err, fieldsToSubmit, setError);
    }
  };

  const showOauthProviders = !hasVerifiedExternalAccount && oauthOptions.length > 0;
  const showWeb3Providers = !hasVerifiedWeb3 && web3Options.length > 0;

  return (
    <>
      <Header
        alert={
          <>
            <Alert type='info'>Please complete the following to sign up</Alert>
            {error && (
              <Alert
                type='error'
                style={{ marginTop: '1em' }}
              >
                {error}
              </Alert>
            )}
          </>
        }
        className='cl-auth-form-header-compact'
      />

      <Body>
        {showOauthProviders && (
          <SignUpOAuth
            oauthOptions={oauthOptions}
            setError={setError}
          />
        )}

        {showWeb3Providers && (
          <SignUpWeb3
            web3Options={web3Options}
            setError={setError}
          />
        )}

        {showFormFields(userSettings) && (
          <>
            {(showOauthProviders || showWeb3Providers) && <Separator />}

            <SignUpForm
              fields={fields}
              formState={formState}
              toggleEmailPhone={emailOrPhone(attributes, isProgressiveSignUp)}
              handleSubmit={handleSubmit}
              handleChangeActive={handleChangeActive}
            />
          </>
        )}

        <Footer>
          <SignInLink />
          <PoweredByClerk className='cl-auth-form-powered-by-clerk' />
        </Footer>
      </Body>
    </>
  );
}

export const SignUpContinue = withRedirectToHome(_SignUpContinue);
