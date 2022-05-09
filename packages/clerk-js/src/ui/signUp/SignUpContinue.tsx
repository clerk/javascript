import { SignUpResource } from '@clerk/types';
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
import { Body, Header } from 'ui/common/authForms';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { SignUpForm } from 'ui/signUp/SignUpForm';

import {
  ActiveIdentifier,
  determineActiveFields,
  emailOrPhoneUsedForFF,
  getInitialActiveIdentifier,
  minimizeFieldsForExistingSignup,
  showFormFields,
} from './sign_up_form_helpers';
import { SignInLink } from './SignInLink';
import { SignUpOAuth } from './SignUpOAuth';
import { SignUpWeb3 } from './SignUpWeb3';

function _SignUpContinue(): JSX.Element | null {
  const { navigate } = useNavigate();
  const environment = useEnvironment();
  const { displayConfig, userSettings } = environment;
  const { attributes } = userSettings;
  const { setSession } = useCoreClerk();
  const { navigateAfterSignUp } = useSignUpContext();
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes),
  );
  const signUp = useCoreSignUp();

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

  const fields = determineActiveFields({
    environment,
    hasEmail,
    activeCommIdentifierType,
    signUp,
  });

  minimizeFieldsForExistingSignup(fields, signUp);

  const oauthOptions = userSettings.socialProviderStrategies;
  const web3Options = userSettings.web3FirstFactors;

  const handleChangeActive = (type: ActiveIdentifier) => (e: React.MouseEvent) => {
    e.preventDefault();

    if (!emailOrPhoneUsedForFF(attributes)) {
      return;
    }

    setActiveCommIdentifierType(type);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fieldsToSubmit = Object.entries(fields).reduce(
      (acc, [k, v]) => [...acc, ...(v.enabled && formState[k as FormStateKey] ? [formState[k as FormStateKey]] : [])],
      [] as Array<FieldState<any>>,
    );

    try {
      setError(undefined);
      const req = buildRequest(fieldsToSubmit);
      const res = await signUp.update(req);
      return completeSignUpFlow(res);
    } catch (err) {
      handleError(err, fieldsToSubmit, setError);
    }
  };

  const completeSignUpFlow = (su: SignUpResource) => {
    if (su.status === 'complete') {
      return setSession(su.createdSessionId, navigateAfterSignUp);
    } else if (su.emailAddress && su.verifications.emailAddress.status !== 'verified') {
      return navigate(displayConfig.signUpUrl + '/verify-email-address');
    } else if (su.phoneNumber && su.verifications.phoneNumber.status !== 'verified') {
      return navigate(displayConfig.signUpUrl + '/verify-phone-number');
    } else if (su.status === 'missing_requirements') {
      // do nothing
    }
  };

  const showOauthProviders = !hasVerifiedExternalAccount && oauthOptions.length > 0;

  const showWeb3Providers = web3Options.length > 0;

  return (
    <>
      <Header
        error={error}
        info={'Please fill in the following information to complete your sign-up'}
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
              toggleEmailPhone={emailOrPhoneUsedForFF(attributes)}
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
