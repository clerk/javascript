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
import { Button, descriptors, Flex } from '../customizables';
import { FlowCard, Footer, Header, SocialButtons } from '../elements';
import { InternalThemeProvider } from '../styledSystem';

export function _SignInStart(): JSX.Element {
  const { userSettings } = useEnvironment();
  const { setActive } = useCoreClerk();
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
            return setActive({
              session: res.createdSessionId,
              beforeEmit: navigateAfterSignIn,
            });
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
          return setActive({
            session: res.createdSessionId,
            beforeEmit: navigateAfterSignIn,
          });
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
      await setActive({
        session: sid,
        beforeEmit: navigateAfterSignIn,
      });
    } else {
      handleError(e, [identifier, instantPassword], setError);
    }
  };

  const handleFirstPartySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return signInWithFields(identifier, instantPassword);
  };

  if (isLoading) {
    return <div>is loading</div>;
  }
  const hasSocialOrWeb3Buttons = !!socialProviderStrategies.length || !!web3FirstFactors.length;

  return (
    <InternalThemeProvider>
      <FlowCard.Root
        flow='signIn'
        page='start'
      >
        <Header.Root>
          <Header.Title>Sign in</Header.Title>
          <Header.Subtitle>to continue to [Appname]</Header.Subtitle>
        </Header.Root>
        <Flex
          direction={'col'}
          elementDescriptor={descriptors.authOptions}
        >
          <SocialButtons.Root />
          <hr style={{ width: '100%' }} />
          <Flex>
            <Button block>this is test</Button>
          </Flex>
        </Flex>

        <Footer.Root>
          <Footer.Action>
            <Footer.ActionText>No account?</Footer.ActionText>
            <Footer.ActionLink
              isExternal
              href='https://www.google.com'
            >
              Sign up
            </Footer.ActionLink>
          </Footer.Action>
          <Footer.Links>
            <Footer.Link
              isExternal
              href='https://www.google.com'
            >
              Help
            </Footer.Link>
            <Footer.Link
              isExternal
              href='https://www.google.com'
            >
              Privacy
            </Footer.Link>
            <Footer.Link
              isExternal
              href='https://www.google.com'
            >
              Terms
            </Footer.Link>
          </Footer.Links>
        </Footer.Root>
      </FlowCard.Root>
    </InternalThemeProvider>
  );
}

const phoneFieldType = 'tel';

export const SignInStart = withRedirectToHome(_SignInStart);
