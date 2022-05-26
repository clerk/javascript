// @ts-ignore
import { default as MobileIcon } from '@clerk/shared/assets/icons/arrow-right.svg';
import { ClerkAPIError, SignInCreateParams } from '@clerk/types';
import React from 'react';

import { ERROR_CODES, getIdentifierControlDisplayValues } from '../../ui/common/constants';
import { handleError } from '../../ui/common/errorHandler';
import { buildRequest, FieldState, useFieldState } from '../../ui/common/forms';
import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { useSupportEmail } from '../../ui/hooks/useSupportEmail';
import { getClerkQueryParam } from '../../utils/getClerkQueryParam';
import { Card, Flex, Button, SecuredByClerk } from '../primitives';

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

  const identifierInputDisplayValues = getIdentifierControlDisplayValues(standardFormAttributes);

  React.useEffect(() => {
    async function handleOauthError() {
      const error = signIn?.firstFactorVerification?.error;

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

        // TODO: This is a workaround in order to reset the sign in attempt
        // so that the oauth error does not persist on full page reloads.
        void (await signIn.create({}));
      }
    }

    void handleOauthError();
  });

  const buildSignInParams = (fields: Array<FieldState<string>>): SignInCreateParams => {
    const hasPassword = fields.some(f => f.name === 'password' && !!f.value);
    if (!hasPassword) {
      fields = fields.filter(f => f.name !== 'password');
    }
    return {
      ...buildRequest(fields),
      ...(hasPassword && { strategy: 'password' }),
    } as SignInCreateParams;
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
        e.code === ERROR_CODES.INVALID_STRATEGY_FOR_USER || e.code === ERROR_CODES.FORM_PASSWORD_INCORRECT,
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

  const handleFirstPartySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return signInWithFields(identifier, instantPassword);
  };

  if (isLoading) {
    // return <LoadingScreen />;
    return <div>is loading</div>;
  }
  const hasSocialOrWeb3Buttons = !!socialProviderStrategies.length || !!web3FirstFactors.length;

  return (
    <div style={{ padding: '100px', width: '100vw' }}>
      <Card>
        <SecuredByClerk />
        <Flex direction='col'>
          <Button colorScheme='danger'>asd</Button>
          <Button>asd</Button>
          <Button>asd</Button>
          <Button>asd</Button>
        </Flex>
        If you can see this, the dev v4 HMR works!!
        <MobileIcon />
      </Card>
    </div>
  );
}

const phoneFieldType = 'tel';

export const SignInStart = withRedirectToHome(_SignInStart);
