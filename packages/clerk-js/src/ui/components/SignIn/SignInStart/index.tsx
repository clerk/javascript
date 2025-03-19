import { useClerk } from '@clerk/shared/react';
import { isWebAuthnSupported } from '@clerk/shared/webauthn';
import { useEffect } from 'react';

import { ERROR_CODES, SIGN_UP_MODES } from '../../../../core/constants';
import { clerkInvalidFAPIResponse } from '../../../../core/errors';
import { getClerkQueryParam, removeClerkQueryParam } from '../../../../utils';
import { withRedirectToAfterSignIn } from '../../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../../customizables';
import {
  Card,
  Header,
  LoadingCard,
  SocialButtonsReversibleContainerWithDivider,
  useCardState,
  withCardStateProvider,
} from '../../../elements';
import { useLoadingStatus } from '../../../hooks';
import { useSupportEmail } from '../../../hooks/useSupportEmail';
import { useRouter } from '../../../router';
import { useHandleAuthenticateWithPasskey } from '../shared';
import { SignInSocialButtons } from '../SignInSocialButtons';
import { SignInStartForm } from './form';
import { useSignInStartErrorHandler } from './recover-start-error';

function PasskeyActionLink() {
  const { userSettings } = useEnvironment();
  const isWebSupported = isWebAuthnSupported();
  const { navigate } = useRouter();
  const onSecondFactor = () => navigate('factor-two');
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);

  if (
    !userSettings.attributes.passkey.enabled ||
    !userSettings.passkeySettings.show_sign_in_button ||
    !isWebSupported
  ) {
    return null;
  }

  return (
    <Card.Action elementId={'usePasskey'}>
      <Card.ActionLink
        localizationKey={localizationKeys('signIn.start.actionLink__use_passkey')}
        onClick={() => authenticateWithPasskey({ flow: 'discoverable' })}
      />
    </Card.Action>
  );
}

function useHandleErrorFromPreviousAttempt() {
  const signIn = useCoreSignIn();
  const card = useCardState();
  useEffect(() => {
    async function handleOauthError() {
      const defaultErrorHandler = () => {
        // Error from server may be too much information for the end user, so set a generic error
        card.setError('Unable to complete action at this time. If the problem persists please contact support.');
      };

      const error = signIn?.firstFactorVerification?.error;
      if (error) {
        switch (error.code) {
          case ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP:
          case ERROR_CODES.OAUTH_ACCESS_DENIED:
          case ERROR_CODES.NOT_ALLOWED_ACCESS:
          case ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING:
          case ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML:
          case ERROR_CODES.USER_LOCKED:
          case ERROR_CODES.EXTERNAL_ACCOUNT_NOT_FOUND:
          case ERROR_CODES.SIGN_UP_MODE_RESTRICTED:
          case ERROR_CODES.SIGN_UP_MODE_RESTRICTED_WAITLIST:
          case ERROR_CODES.ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING:
          case ERROR_CODES.ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH:
          case ERROR_CODES.ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH:
          case ERROR_CODES.SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH:
          case ERROR_CODES.ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO:
            card.setError(error);
            break;
          default:
            defaultErrorHandler();
        }

        // TODO: This is a workaround in order to reset the sign in attempt
        // so that the oauth error does not persist on full page reloads.
        void (await signIn.create({}));
      }
    }

    void handleOauthError();
  }, []);
  return null;
}

/**
 * Attempts to sign in with a ticket from the url.
 * When `__clerk_status` is `sign_up`, we navigate to the sign up flow,
 * otherwise we attempt to sign in with the ticket.
 */
function useTicketInvitation() {
  const { navigate } = useRouter();
  const signIn = useCoreSignIn();
  const { setActive } = useClerk();

  const { isCombinedFlow, signUpUrl, afterSignInUrl } = useSignInContext();
  const supportEmail = useSupportEmail();
  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';

  // Improves flash of loading spinner when a ticket is available.
  const status = useLoadingStatus({
    status: organizationTicket ? 'loading' : 'idle',
  });

  const attemptToRecoverFromSignInError = useSignInStartErrorHandler();

  useEffect(() => {
    if (!organizationTicket) {
      return;
    }

    if (clerkStatus === 'sign_up') {
      const paramsToForward = new URLSearchParams();
      if (organizationTicket) {
        paramsToForward.set('__clerk_ticket', organizationTicket);
      }
      // We explicitly navigate to 'create' in the combined flow to trigger a client-side navigation. Navigating to
      // signUpUrl triggers a full page reload when used with the hash router.
      void navigate(isCombinedFlow ? `create` : signUpUrl, { searchParams: paramsToForward });
      return;
    }

    status.setLoading();
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
            removeClerkQueryParam('__clerk_ticket');
            return setActive({
              session: res.createdSessionId,
              redirectUrl: afterSignInUrl,
            });
          default: {
            console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
            return;
          }
        }
      })
      .catch(err => {
        return attemptToRecoverFromSignInError(err, organizationTicket);
      })
      .finally(() => {
        status.setIdle();
      });
    // run once on mount
  }, []);

  return {
    status,
  };
}

function SignUpOrWaitlistActionLink() {
  const { userSettings } = useEnvironment();
  const clerk = useClerk();
  const { signUpUrl, isCombinedFlow, waitlistUrl } = useSignInContext();

  if (userSettings.signUp.mode === SIGN_UP_MODES.PUBLIC && !isCombinedFlow) {
    return (
      <Card.Action elementId='signIn'>
        <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />
        <Card.ActionLink
          localizationKey={localizationKeys('signIn.start.actionLink')}
          to={clerk.buildUrlWithAuth(signUpUrl)}
        />
      </Card.Action>
    );
  }

  if (userSettings.signUp.mode === SIGN_UP_MODES.WAITLIST) {
    return (
      <Card.Action elementId='signIn'>
        <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText__join_waitlist')} />
        <Card.ActionLink
          localizationKey={localizationKeys('signIn.start.actionLink__join_waitlist')}
          to={clerk.buildUrlWithAuth(waitlistUrl)}
        />
      </Card.Action>
    );
  }

  return null;
}

function SignInStartInternal(): JSX.Element {
  const card = useCardState();
  const status = useLoadingStatus();
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';
  const { userSettings } = useEnvironment();

  const ctx = useSignInContext();
  const { isCombinedFlow } = ctx;

  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;

  const hasSocialOrWeb3Buttons = !!authenticatableSocialStrategies.length || !!web3FirstFactors.length;

  /**
   * Handle previous failed sign in attempt.
   */
  useHandleErrorFromPreviousAttempt();

  /**
   * Parse ticket from url and attempt sign in.
   */
  const { status: ticketStatus } = useTicketInvitation();

  if (status.isLoading || ticketStatus.isLoading || clerkStatus === 'sign_up') {
    // clerkStatus being sign_up will trigger a navigation to the sign up flow, so show a loading card instead of
    // rendering the sign in flow.
    return <LoadingCard />;
  }

  return (
    <Flow.Part part='start'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title
              localizationKey={
                isCombinedFlow ? localizationKeys('signIn.start.titleCombined') : localizationKeys('signIn.start.title')
              }
            />
            <Header.Subtitle
              localizationKey={
                isCombinedFlow
                  ? localizationKeys('signIn.start.subtitleCombined')
                  : localizationKeys('signIn.start.subtitle')
              }
              sx={{
                '&:empty': {
                  display: 'none',
                },
              }}
            />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <SocialButtonsReversibleContainerWithDivider>
              {hasSocialOrWeb3Buttons && (
                <SignInSocialButtons
                  enableWeb3Providers
                  enableOAuthProviders
                />
              )}
              <SignInStartForm />
            </SocialButtonsReversibleContainerWithDivider>
            <PasskeyActionLink />
          </Col>
        </Card.Content>
        <Card.Footer>
          <SignUpOrWaitlistActionLink />
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
}

export const SignInStart = withRedirectToAfterSignIn(withCardStateProvider(SignInStartInternal));
