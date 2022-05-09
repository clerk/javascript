import { noop } from '@clerk/shared/utils';
import { SignUpCreateParams, SignUpResource } from '@clerk/types';
import React from 'react';
import type { FieldState } from 'ui/common';
import {
  buildRequest,
  Footer,
  handleError,
  LoadingScreen,
  PoweredByClerk,
  Separator,
  useFieldState,
  withRedirectToHome,
} from 'ui/common';
import { Body, Header } from 'ui/common/authForms';
import { ERROR_CODES } from 'ui/common/constants';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { getClerkQueryParam } from 'utils/getClerkQueryParam';

import {
  ActiveIdentifier,
  determineActiveFields,
  emailOrPhoneUsedForFF,
  getInitialActiveIdentifier,
  showFormFields,
} from './sign_up_form_helpers';
import { SignInLink } from './SignInLink';
import { SignUpForm } from './SignUpForm';
import { SignUpOAuth } from './SignUpOAuth';
import { SignUpWeb3 } from './SignUpWeb3';

function _SignUpStart(): JSX.Element {
  const { navigate } = useNavigate();
  const environment = useEnvironment();
  const { userSettings } = environment;
  const { attributes } = userSettings;
  const { setSession } = useCoreClerk();
  const { navigateAfterSignUp } = useSignUpContext();
  const [activeCommIdentifierType, setActiveCommIdentifierType] = React.useState<ActiveIdentifier>(
    getInitialActiveIdentifier(attributes),
  );
  const signUp = useCoreSignUp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMissingRequirements, setMissingRequirements] = React.useState(false);

  const formState = {
    firstName: useFieldState('first_name', ''),
    lastName: useFieldState('last_name', ''),
    emailAddress: useFieldState('email_address', ''),
    username: useFieldState('username', ''),
    phoneNumber: useFieldState('phone_number', ''),
    password: useFieldState('password', ''),
    ticket: useFieldState(
      'ticket',
      getClerkQueryParam('__clerk_ticket') || getClerkQueryParam('__clerk_invitation_token') || '',
    ),
  } as const;

  type FormStateKey = keyof typeof formState;

  const [error, setError] = React.useState<string | undefined>();
  const hasTicket = !!formState.ticket.value;
  const hasEmail = !!formState.emailAddress.value;

  const fields = determineActiveFields({
    environment,
    hasTicket,
    hasEmail,
    activeCommIdentifierType,
  });

  const oauthOptions = userSettings.socialProviderStrategies;
  const web3Options = userSettings.web3FirstFactors;

  const handleTokenFlow = () => {
    const ticket = formState.ticket.value;

    if (!ticket) {
      return;
    }

    const signUpParams: SignUpCreateParams = { strategy: 'ticket', ticket };

    setIsLoading(true);

    signUp
      .create(signUpParams)
      .then(res => {
        formState.emailAddress.setValue(res.emailAddress || '');
        void completeSignUpFlow(res);
      })
      .catch(err => {
        /* Clear ticket values when an error occurs in the initial sign up attempt */
        formState.ticket.setValue('');
        handleError(err, [], setError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  React.useLayoutEffect(() => {
    if (Object.values(fields).filter(f => f.enabled && !f.required).length) {
      return;
    }

    void handleTokenFlow();
  }, []);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signUp.verifications.externalAccount.error;

      if (error) {
        switch (error.code) {
          case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
          case ERROR_CODES.OAUTH_ACCESS_DENIED:
            setError(error.longMessage);
            break;
          default:
            // Error from server may be too much information for the end user, so set a generic error
            setError('Unable to complete action at this time. If the problem persists please contact support.');
        }

        // TODO: This is a hack to reset the sign in attempt so that the oauth error
        // does not persist on full page reloads.
        //
        // We will revise this strategy as part of the Clerk DX epic.
        void (await signUp.create({}));
      }
    }

    void handleOauthError();
  });

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

    if (fields.ticket.enabled) {
      // fieldsToSubmit: Constructing a fake fields object for strategy.
      fieldsToSubmit.push({
        name: 'strategy',
        value: 'ticket',
        setError: noop,
        setValue: noop,
        error: undefined,
      });
    }

    try {
      setError(undefined);
      const res = await signUp.create(buildRequest(fieldsToSubmit));
      return completeSignUpFlow(res);
    } catch (err) {
      handleError(err, fieldsToSubmit, setError);
    }
  };

  const completeSignUpFlow = (su: SignUpResource) => {
    if (su.status === 'complete') {
      return setSession(su.createdSessionId, navigateAfterSignUp);
    } else if (su.emailAddress && su.verifications.emailAddress.status !== 'verified') {
      return navigate('verify-email-address');
    } else if (su.phoneNumber && su.verifications.phoneNumber.status !== 'verified') {
      return navigate('verify-phone-number');
    } else if (su.status === 'missing_requirements') {
      setMissingRequirements(true);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Header
        error={error}
        className='cl-auth-form-header-compact'
      />
      <Body>
        {(!hasTicket || (hasTicket && isMissingRequirements)) && oauthOptions.length > 0 && (
          <SignUpOAuth
            oauthOptions={oauthOptions}
            setError={setError}
          />
        )}

        {!hasTicket && web3Options.length > 0 && (
          <SignUpWeb3
            web3Options={web3Options}
            setError={setError}
          />
        )}

        {showFormFields(userSettings) && (
          <>
            {(oauthOptions.length > 0 || web3Options.length > 0) && <Separator />}

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

export const SignUpStart = withRedirectToHome(_SignUpStart);
