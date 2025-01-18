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
import { useHandleAuthenticateWithPasskey } from './shared';
import { SignInSocialButtons } from './SignInSocialButtons';
import { getSignUpAttributeFromIdentifier } from './utils';

const useAutoFillPasskey = () => {
  const [isSupported, setIsSupported] = useState(false);
  const { navigate } = useRouter();
  const onSecondFactor = () => navigate('factor-two');
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);
  const { userSettings } = useEnvironment();
  const { passkeySettings, attributes } = userSettings;

  useEffect(() => {
    async function runAutofillPasskey() {
      const _isSupported = await isWebAuthnAutofillSupported();
      setIsSupported(_isSupported);
      if (!_isSupported) {
        return;
      }

      await authenticateWithPasskey({ flow: 'autofill' });
    }

    if (passkeySettings.allow_autofill && attributes.passkey.enabled) {
      runAutofillPasskey();
    }
  }, []);

  return {
    isWebAuthnAutofillSupported: isSupported,
  };
};

export function _SignInStart(): JSX.Element {
  const card = useCardState();
  const clerk = useClerk();
  const status = useLoadingStatus();
  const { displayConfig, userSettings } = useEnvironment();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const ctx = useSignInContext();
  const { afterSignInUrl, signUpUrl, waitlistUrl, isCombinedFlow } = ctx;
  const supportEmail = useSupportEmail();
  const identifierAttributes = useMemo<SignInStartIdentifier[]>(
    () => groupIdentifiers(userSettings.enabledFirstFactorIdentifiers),
    [userSettings.enabledFirstFactorIdentifiers],
  );

  /**
   * Passkeys
   */
  const { isWebAuthnAutofillSupported } = useAutoFillPasskey();
  const onSecondFactor = () => navigate('factor-two');
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);
  const isWebSupported = isWebAuthnSupported();

  const onlyPhoneNumberInitialValueExists =
    !!ctx.initialValues?.phoneNumber && !(ctx.initialValues.emailAddress || ctx.initialValues.username);
  const shouldStartWithPhoneNumberIdentifier =
    onlyPhoneNumberInitialValueExists && identifierAttributes.includes('phone_number');
  const [identifierAttribute, setIdentifierAttribute] = useState<SignInStartIdentifier>(
    shouldStartWithPhoneNumberIdentifier ? 'phone_number' : identifierAttributes[0] || '',
  );
  const [hasSwitchedByAutofill, setHasSwitchedByAutofill] = useState(false);

  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';

  const standardFormAttributes = userSettings.enabledFirstFactorIdentifiers;
  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;
  const passwordBasedInstance = userSettings.instanceIsPasswordBased;
  const { currentIdentifier, nextIdentifier } = getIdentifierControlDisplayValues(
    identifierAttributes,
    identifierAttribute,
  );
  const instantPasswordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
  });

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

  const switchToNextIdentifier = () => {
    setIdentifierAttribute(
      i => identifierAttributes[(identifierAttributes.indexOf(i) + 1) % identifierAttributes.length],
    );
    setShouldAutofocus(true);
    setHasSwitchedByAutofill(false);
  };

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
            return clerk.setActive({
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

  const buildSignInParams = (fields: Array<FormControlState<string>>): SignInCreateParams => {
    const hasPassword = fields.some(f => f.name === 'password' && !!f.value);

    /**
     * FAPI will return an error when password is submitted but the user's email matches requires enterprise sso authentication.
     * We need to strip password from the create request, and reconstruct it later.
     */
    if (!hasPassword || userSettings.enterpriseSSO.enabled) {
      fields = fields.filter(f => f.name !== 'password');
    }
    return {
      ...buildRequest(fields),
      ...(hasPassword && !userSettings.enterpriseSSO.enabled && { strategy: 'password' }),
    } as SignInCreateParams;
  };

  const safePasswordSignInForEnterpriseSSOInstance = (
    signInCreatePromise: Promise<SignInResource>,
    fields: Array<FormControlState<string>>,
  ) => {
    return signInCreatePromise.then(signInResource => {
      if (!userSettings.enterpriseSSO.enabled) {
        return signInResource;
      }
      /**
       * For instances with Enterprise SSO enabled, perform sign in with password only when it is allowed for the identified user.
       */
      const passwordField = fields.find(f => f.name === 'password')?.value;
      if (
        !passwordField ||
        signInResource.supportedFirstFactors?.some(ff => ff.strategy === 'saml' || ff.strategy === 'enterprise_sso')
      ) {
        return signInResource;
      }
      return signInResource.attemptFirstFactor({ strategy: 'password', password: passwordField });
    });
  };

  const signInWithFields = async (...fields: Array<FormControlState<string>>) => {
    try {
      const res = await safePasswordSignInForEnterpriseSSOInstance(signIn.create(buildSignInParams(fields)), fields);

      switch (res.status) {
        case 'needs_identifier':
          // Check if we need to initiate an enterprise sso flow
          if (res.supportedFirstFactors?.some(ff => ff.strategy === 'saml' || ff.strategy === 'enterprise_sso')) {
            await authenticateWithEnterpriseSSO();
          }
          break;
        case 'needs_first_factor':
          if (res.supportedFirstFactors?.every(ff => ff.strategy === 'enterprise_sso')) {
            await authenticateWithEnterpriseSSO();
            break;
          }
          return navigate('factor-one');
        case 'needs_second_factor':
          return navigate('factor-two');
        case 'complete':
          return clerk.setActive({
            session: res.createdSessionId,
            redirectUrl: afterSignInUrl,
          });
        default: {
          console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
          return;
        }
      }
    } catch (e) {
      return attemptToRecoverFromSignInError(e);
    }
  };

  const authenticateWithEnterpriseSSO = async () => {
    const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
    const redirectUrlComplete = ctx.afterSignInUrl || '/';

    return signIn.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
    });
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
    const accountDoesNotExistError: ClerkAPIError = e.errors.find(
      (e: ClerkAPIError) =>
        e.code === ERROR_CODES.INVITATION_ACCOUNT_NOT_EXISTS || e.code === ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND,
    );

    if (instantPasswordError) {
      await signInWithFields(identifierField);
    } else if (alreadySignedInError) {
      const sid = alreadySignedInError.meta!.sessionId!;
      await clerk.setActive({ session: sid, redirectUrl: afterSignInUrl });
    } else if (isCombinedFlow && accountDoesNotExistError) {
      const attribute = getSignUpAttributeFromIdentifier(identifierField);

      if (userSettings.signUp.mode === SIGN_UP_MODES.WAITLIST) {
        const waitlistUrl = clerk.buildWaitlistUrl(
          attribute === 'emailAddress'
            ? {
                initialValues: {
                  [attribute]: identifierField.value,
                },
              }
            : {},
        );
        return navigate(waitlistUrl);
      }

      clerk.client.signUp[attribute] = identifierField.value;

      const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signUpUrl);
      const redirectUrlComplete = ctx.afterSignUpUrl || '/';

      return handleCombinedFlowTransfer({
        afterSignUpUrl: ctx.afterSignUpUrl || '/',
        clerk,
        handleError: e => handleError(e, [identifierField, instantPasswordField], card.setError),
        identifierAttribute: attribute,
        identifierValue: identifierField.value,
        navigate,
        organizationTicket,
        signUpMode: userSettings.signUp.mode,
        redirectUrl,
        redirectUrlComplete,
        passwordEnabled: userSettings.attributes.password.required,
      });
    } else {
      handleError(e, [identifierField, instantPasswordField], card.setError);
    }
  };

  const handleFirstPartySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return signInWithFields(identifierField, instantPasswordField);
  };

  const DynamicField = useMemo(() => {
    const components = {
      tel: Form.PhoneInput,
      password: Form.PasswordInput,
      text: Form.PlainInput,
      email: Form.PlainInput,
    };

    return components[identifierField.type as keyof typeof components];
  }, [identifierField.type]);

  if (status.isLoading || clerkStatus === 'sign_up') {
    // clerkStatus being sign_up will trigger a navigation to the sign up flow, so show a loading card instead of
    // rendering the sign in flow.
    return <LoadingCard />;
  }

  // @ts-expect-error `action` is not typed
  const { action, ...identifierFieldProps } = identifierField.props;
  return (
    <Flow.Part part='start'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            {isCombinedFlow ? (
              <Header.Title localizationKey={localizationKeys('signIn.start.titleCombined')} />
            ) : (
              <>
                <Header.Title localizationKey={localizationKeys('signIn.start.title')} />
                <Header.Subtitle localizationKey={localizationKeys('signIn.start.subtitle')} />
              </>
            )}
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
              {standardFormAttributes.length ? (
                <Form.Root
                  onSubmit={handleFirstPartySubmit}
                  gap={8}
                >
                  <Col gap={6}>
                    <Form.ControlRow elementId={identifierField.id}>
                      <DynamicField
                        actionLabel={nextIdentifier?.action}
                        onActionClicked={switchToNextIdentifier}
                        {...identifierFieldProps}
                        autoFocus={shouldAutofocus}
                        autoComplete={isWebAuthnAutofillSupported ? 'webauthn' : undefined}
                      />
                    </Form.ControlRow>
                    <InstantPasswordRow field={passwordBasedInstance ? instantPasswordField : undefined} />
                  </Col>
                  <Form.SubmitButton hasArrow />
                </Form.Root>
              ) : null}
            </SocialButtonsReversibleContainerWithDivider>
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

const InstantPasswordRow = ({ field }: { field?: FormControlState<'password'> }) => {
  const [autofilled, setAutofilled] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const show = !!(autofilled || field?.value);

  // show password if it's autofilled by the browser
  useLayoutEffect(() => {
    const intervalId = setInterval(() => {
      if (ref?.current) {
        const autofilled =
          window.getComputedStyle(ref.current, ':autofill').animationName === 'onAutoFillStart' ||
          // https://github.com/facebook/react/issues/1159#issuecomment-1025423604
          !!ref.current?.matches('*:-webkit-autofill');
        if (autofilled) {
          setAutofilled(autofilled);
          clearInterval(intervalId);
        }
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    //if the field receives a value, we default to normal behaviour
    if (field?.value && field.value !== '') {
      setAutofilled(false);
    }
  }, [field?.value]);

  if (!field) {
    return null;
  }

  return (
    <Form.ControlRow
      elementId={field.id}
      sx={show ? undefined : { position: 'absolute', opacity: 0, height: 0, pointerEvents: 'none', marginTop: '-1rem' }}
    >
      <Form.PasswordInput
        {...field.props}
        ref={ref}
        tabIndex={show ? undefined : -1}
      />
    </Form.ControlRow>
  );
};

export const SignInStart = withRedirectToAfterSignIn(withCardStateProvider(_SignInStart));
