import { useClerk } from '@clerk/shared/react';
import { isWebAuthnAutofillSupported, isWebAuthnSupported } from '@clerk/shared/webauthn';
import type { ClerkAPIError, SignInCreateParams, SignInResource } from '@clerk/types';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { ERROR_CODES, SIGN_UP_MODES } from '../../../core/constants';
import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { getClerkQueryParam, removeClerkQueryParam } from '../../../utils';
import type { SignInStartIdentifier } from '../../common';
import { getIdentifierControlDisplayValues, groupIdentifiers, withRedirectToAfterSignIn } from '../../common';
import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import {
  Card,
  Form,
  Header,
  LoadingCard,
  SocialButtonsReversibleContainerWithDivider,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useLoadingStatus } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import type { FormControlState } from '../../utils';
import { buildRequest, handleError, isMobileDevice, useFormControl } from '../../utils';
import { handleCombinedFlowTransfer } from './handleCombinedFlowTransfer';
import { InstantPassword } from './InstantPassword';
import { useHandleAuthenticateWithPasskey } from './shared';
import { SignInSocialButtons } from './SignInSocialButtons';
import { getSignUpAttributeFromIdentifier } from './utils';
import { SignInStartForm } from './form';
import { useAutoFillPasskey } from './use-passkey-autofill';

function PasskeyActionLink() {
  const { userSettings } = useEnvironment();
  const isWebSupported = isWebAuthnSupported();
  const { navigate } = useRouter();
  const onSecondFactor = () => navigate('factor-two');
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);

  return (
    <>
      {userSettings.attributes.passkey.enabled &&
        userSettings.passkeySettings.show_sign_in_button &&
        isWebSupported && (
          <Card.Action elementId={'usePasskey'}>
            <Card.ActionLink
              localizationKey={localizationKeys('signIn.start.actionLink__use_passkey')}
              onClick={() => authenticateWithPasskey({ flow: 'discoverable' })}
            />
          </Card.Action>
        )}
    </>
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

function useOrganizationInvitation() {
  const card = useCardState();
  const { navigate } = useRouter();
  const signIn = useCoreSignIn();
  const { setActive } = useClerk();
  const status = useLoadingStatus();
  const { isCombinedFlow, signUpUrl, afterSignInUrl } = useSignInContext();
  const supportEmail = useSupportEmail();
  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';

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
    card.setLoading();
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
        return attemptToRecoverFromSignInError(err);
      })
      .finally(() => {
        status.setIdle();
        card.setIdle();
      });
  }, []);

  return {
    status,
  };
}

function SignInStartInternal(): JSX.Element {
  const card = useCardState();
  const clerk = useClerk();
  const status = useLoadingStatus();
  const { userSettings } = useEnvironment();

  const ctx = useSignInContext();
  const { signUpUrl, waitlistUrl, isCombinedFlow } = ctx;

  const identifierAttributes = useMemo<SignInStartIdentifier[]>(
    () => groupIdentifiers(userSettings.enabledFirstFactorIdentifiers),
    [userSettings.enabledFirstFactorIdentifiers],
  );

  const onlyPhoneNumberInitialValueExists =
    !!ctx.initialValues?.phoneNumber && !(ctx.initialValues.emailAddress || ctx.initialValues.username);
  const shouldStartWithPhoneNumberIdentifier =
    onlyPhoneNumberInitialValueExists && identifierAttributes.includes('phone_number');
  const [identifierAttribute, setIdentifierAttribute] = useState<SignInStartIdentifier>(
    shouldStartWithPhoneNumberIdentifier ? 'phone_number' : identifierAttributes[0] || '',
  );
  const [hasSwitchedByAutofill, setHasSwitchedByAutofill] = useState(false);

  // const clerkStatus = getClerkQueryParam('__clerk_status') || '';

  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;

  const { currentIdentifier } = getIdentifierControlDisplayValues(identifierAttributes, identifierAttribute);

  const ctxInitialValues = ctx.initialValues || {};
  const initialValues: Record<SignInStartIdentifier, string | undefined> = useMemo(
    () => ({
      email_address: ctxInitialValues.emailAddress,
      email_address_username: ctxInitialValues.emailAddress || ctxInitialValues.username,
      username: ctxInitialValues.username,
      phone_number: ctxInitialValues.phoneNumber,
    }),
    [ctx.initialValues],
  );

  const hasSocialOrWeb3Buttons = !!authenticatableSocialStrategies.length || !!web3FirstFactors.length;
  const [shouldAutofocus, setShouldAutofocus] = useState(!isMobileDevice() && !hasSocialOrWeb3Buttons);
  const textIdentifierField = useFormControl('identifier', initialValues[identifierAttribute] || '', {
    ...currentIdentifier,
    isRequired: true,
    transformer: value => value.trim(),
  });

  const phoneIdentifierField = useFormControl('identifier', initialValues['phone_number'] || '', {
    ...currentIdentifier,
    isRequired: true,
  });

  const identifierField = identifierAttribute === 'phone_number' ? phoneIdentifierField : textIdentifierField;

  const handlePhoneNumberPaste = (value: string) => {
    textIdentifierField.setValue(initialValues[identifierAttribute] || '');
    phoneIdentifierField.setValue(value);
    setIdentifierAttribute('phone_number');
    setShouldAutofocus(true);
  };

  // switch to the phone input (if available) if a "+" is entered
  // (either by the browser or the user)
  // this does not work in chrome as it does not fire the change event and the value is
  // not available via js
  useLayoutEffect(() => {
    if (
      identifierField.value.startsWith('+') &&
      identifierAttributes.includes('phone_number') &&
      identifierAttribute !== 'phone_number' &&
      !hasSwitchedByAutofill
    ) {
      handlePhoneNumberPaste(identifierField.value);
      // do not switch automatically on subsequent autofills
      // by the browser to avoid a switch loop
      setHasSwitchedByAutofill(true);
    }
  }, [identifierField.value, identifierAttributes]);

  /**
   * Handle previous failed sign in attempt
   */
  useHandleErrorFromPreviousAttempt();

  // useEffect(() => {
  //   if (!organizationTicket) {
  //     return;
  //   }
  //
  //   if (clerkStatus === 'sign_up') {
  //     const paramsToForward = new URLSearchParams();
  //     if (organizationTicket) {
  //       paramsToForward.set('__clerk_ticket', organizationTicket);
  //     }
  //     // We explicitly navigate to 'create' in the combined flow to trigger a client-side navigation. Navigating to
  //     // signUpUrl triggers a full page reload when used with the hash router.
  //     void navigate(isCombinedFlow ? `create` : signUpUrl, { searchParams: paramsToForward });
  //     return;
  //   }
  //
  //   status.setLoading();
  //   card.setLoading();
  //   signIn
  //     .create({
  //       strategy: 'ticket',
  //       ticket: organizationTicket,
  //     })
  //     .then(res => {
  //       switch (res.status) {
  //         case 'needs_first_factor':
  //           return navigate('factor-one');
  //         case 'needs_second_factor':
  //           return navigate('factor-two');
  //         case 'complete':
  //           removeClerkQueryParam('__clerk_ticket');
  //           return clerk.setActive({
  //             session: res.createdSessionId,
  //             redirectUrl: afterSignInUrl,
  //           });
  //         default: {
  //           console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
  //           return;
  //         }
  //       }
  //     })
  //     .catch(err => {
  //       return attemptToRecoverFromSignInError(err);
  //     })
  //     .finally(() => {
  //       status.setIdle();
  //       card.setIdle();
  //     });
  // }, []);

  if (status.isLoading || clerkStatus === 'sign_up') {
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
          {/*TODO: extract main in its own component */}
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
          {userSettings.signUp.mode === SIGN_UP_MODES.PUBLIC && !isCombinedFlow && (
            <Card.Action elementId='signIn'>
              <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signIn.start.actionLink')}
                to={clerk.buildUrlWithAuth(signUpUrl)}
              />
            </Card.Action>
          )}
          {userSettings.signUp.mode === SIGN_UP_MODES.WAITLIST && (
            <Card.Action elementId='signIn'>
              <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText__join_waitlist')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signIn.start.actionLink__join_waitlist')}
                to={clerk.buildUrlWithAuth(waitlistUrl)}
              />
            </Card.Action>
          )}
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
}

export const SignInStart = withRedirectToAfterSignIn(withCardStateProvider(SignInStartInternal));
