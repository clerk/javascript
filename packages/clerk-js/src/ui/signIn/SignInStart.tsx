import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { PhoneInput } from '@clerk/shared/components/phoneInput';
import { ClerkAPIError, SignInParams } from '@clerk/types';
import cn from 'classnames';
import React from 'react';
import {
  buildRequest,
  FieldState,
  getIdentifierControlDisplayValues,
  handleError,
  LoadingScreen,
  PoweredByClerk,
  Separator,
  useFieldState,
  withRedirectToHome,
} from 'ui/common';
import { Body, Header } from 'ui/common/authForms';
import { ERROR_CODES } from 'ui/common/constants';
import {
  useCoreClerk,
  useCoreSignIn,
  useEnvironment,
  useSignInContext,
} from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { useSupportEmail } from 'ui/hooks/useSupportEmail';
import { getClerkQueryParam } from 'utils/getClerkQueryParam';

import { SignUpLink } from './SignUpLink';
import { OAuth, Web3 } from './strategies';

export function _SignInStart(): JSX.Element {
  const { userSettings } = useEnvironment();
  const { setSession } = useCoreClerk();
  const signIn = useCoreSignIn();
  const { navigate } = useNavigate();
  const { navigateAfterSignIn } = useSignInContext();
  const supportEmail = useSupportEmail();

  const identifier = useFieldState('identifier', '');
  const instantPassword = useFieldState('password', '');
  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

  const standardFormAttributes = userSettings.enabledFirstFactorIdentifiers;
  const web3FirstFactors = userSettings.web3FirstFactors;
  const socialProviderStrategies = userSettings.socialProviderStrategies;
  const passwordBasedInstance = userSettings.instanceIsPasswordBased;

  React.useEffect(() => {
    if (!organizationTicket) {
      return;
    }

    setIsLoading(true);
    signIn
      .create({
        strategy: 'ticket',
        ticket: organizationTicket,
      })
      .then(res => {
        switch (res.status) {
          case 'needs_first_factor':
            return navigate('factor-one');
          case 'needs_second_factor':
            return navigate('factor-two');
          case 'complete':
            return setSession(res.createdSessionId, navigateAfterSignIn);
          default: {
            const msg = `Response: ${res.status} not supported yet.\nFor more information contact us at ${supportEmail}`;
            alert(msg);
          }
        }
      })
      .catch(err => {
        return attemptToRecoverFromSignInError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const identifierInputDisplayValues = getIdentifierControlDisplayValues(
    standardFormAttributes,
  );

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signIn?.firstFactorVerification?.error;
      if (
        error?.code === ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP ||
        error?.code === ERROR_CODES.OAUTH_ACCESS_DENIED
      ) {
        setError(error.longMessage);
        // TODO: This is a workaround in order to reset the sign in attempt
        // so that the oauth error does not persist on full page reloads.
        void (await signIn.create({}));
      }
    }

    void handleOauthError();
  });

  const buildSignInParams = (
    fields: Array<FieldState<string>>,
  ): SignInParams => {
    const hasPassword = fields.some(f => f.name === 'password' && !!f.value);
    if (!hasPassword) {
      fields = fields.filter(f => f.name !== 'password');
    }
    return {
      ...buildRequest(fields),
      ...(hasPassword && { strategy: 'password' }),
    } as SignInParams;
  };

  const signInWithFields = async (...fields: Array<FieldState<string>>) => {
    try {
      const res = await signIn.create(buildSignInParams(fields));
      switch (res.status) {
        case 'needs_first_factor':
          return navigate('factor-one');
        case 'needs_second_factor':
          return navigate('factor-two');
        case 'complete':
          return setSession(res.createdSessionId, navigateAfterSignIn);
        default: {
          const msg = `Response: ${res.status} not supported yet.\nFor more information contact us at ${supportEmail}`;
          alert(msg);
        }
      }
    } catch (e) {
      return attemptToRecoverFromSignInError(e);
    }
  };

  const attemptToRecoverFromSignInError = async (e: any) => {
    if (!e.errors) {
      return;
    }
    const instantPasswordError: ClerkAPIError = e.errors.find(
      (e: ClerkAPIError) =>
        e.code === ERROR_CODES.INVALID_STRATEGY_FOR_USER ||
        e.code === ERROR_CODES.FORM_PASSWORD_INCORRECT,
    );
    const alreadySignedInError: ClerkAPIError = e.errors.find(
      (e: ClerkAPIError) => e.code === 'identifier_already_signed_in',
    );

    if (instantPasswordError) {
      await signInWithFields(identifier);
    } else if (alreadySignedInError) {
      const sid = alreadySignedInError.meta!.sessionId!;
      await setSession(sid, navigateAfterSignIn);
    } else {
      handleError(e, [identifier, instantPassword], setError);
    }
  };

  const handleFirstPartySubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    return signInWithFields(identifier, instantPassword);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  const hasSocialOrWeb3Buttons =
    !!socialProviderStrategies.length || !!web3FirstFactors.length;

  return (
    <>
      <Header error={error} />
      <Body>
        <OAuth
          oauthOptions={socialProviderStrategies}
          setError={setError}
          error={error}
        />
        <Web3
          web3Options={web3FirstFactors}
          setError={setError}
          error={error}
        />

        {standardFormAttributes.length > 0 && (
          <>
            {hasSocialOrWeb3Buttons && <Separator />}
            <Form
              handleSubmit={handleFirstPartySubmit}
              submitButtonClassName='cl-sign-in-button'
              submitButtonLabel='Continue'
            >
              <Control
                label={identifierInputDisplayValues.label}
                labelClassName='cl-label'
                error={identifier.error}
                htmlFor='text-field-identifier'
              >
                {identifierInputDisplayValues.fieldType === phoneFieldType ? (
                  <PhoneInput
                    id='text-field-identifier'
                    name='text-field-identifier'
                    handlePhoneChange={identifier.setValue}
                  />
                ) : (
                  <Input
                    id='text-field-identifier'
                    name='text-field-identifier'
                    type={identifierInputDisplayValues.fieldType as any}
                    handleChange={el => identifier.setValue(el.value || '')}
                    value={identifier.value}
                    autoFocus
                    minLength={1}
                    maxLength={255}
                  />
                )}
              </Control>

              <>
                {passwordBasedInstance && (
                  <Control
                    key='password'
                    htmlFor='password'
                    label='Password'
                    error={instantPassword.error}
                    className={cn({
                      'cl-hidden': !instantPassword.value,
                    })}
                  >
                    <Input
                      id='password'
                      type='password'
                      name='password'
                      value={instantPassword.value}
                      handleChange={el =>
                        instantPassword.setValue(el.value || '')
                      }
                      tabIndex={-1}
                    />
                  </Control>
                )}
              </>
            </Form>
          </>
        )}
        <SignUpLink />
        <PoweredByClerk className='cl-auth-form-powered-by-clerk' />
      </Body>
    </>
  );
}

const phoneFieldType = 'tel';

export const SignInStart = withRedirectToHome(_SignInStart);
