import { useClerk } from '@clerk/shared/react';
import { isWebAuthnAutofillSupported, isWebAuthnSupported } from '@clerk/shared/webauthn';
import type { ClerkAPIError, SignInCreateParams, SignInResource } from '@clerk/types';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { ERROR_CODES } from '../../../core/constants';
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
import { useHandleAuthenticateWithPasskey } from './shared';
import { SignInSocialButtons } from './SignInSocialButtons';

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
  const { navigateAfterSignIn, signUpUrl } = ctx;
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
              beforeEmit: navigateAfterSignIn,
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
     * FAPI will return an error when password is submitted but the user's email matches requires SAML authentication.
     * We need to strip password from the create request, and reconstruct it later.
     */
    if (!hasPassword || userSettings.saml.enabled) {
      fields = fields.filter(f => f.name !== 'password');
    }
    return {
      ...buildRequest(fields),
      ...(hasPassword && !userSettings.saml.enabled && { strategy: 'password' }),
    } as SignInCreateParams;
  };

  const safePasswordSignInForSamlInstance = (
    signInCreatePromise: Promise<SignInResource>,
    fields: Array<FormControlState<string>>,
  ) => {
    return signInCreatePromise.then(signInResource => {
      if (!userSettings.saml.enabled) {
        return signInResource;
      }
      /**
       * For SAML enabled instances, perform sign in with password only when it is allowed for the identified user.
       */
      const passwordField = fields.find(f => f.name === 'password')?.value;
      if (!passwordField || signInResource.supportedFirstFactors.some(ff => ff.strategy === 'saml')) {
        return signInResource;
      }
      return signInResource.attemptFirstFactor({ strategy: 'password', password: passwordField });
    });
  };

  const signInWithFields = async (...fields: Array<FormControlState<string>>) => {
    try {
      const res = await safePasswordSignInForSamlInstance(signIn.create(buildSignInParams(fields)), fields);

      switch (res.status) {
        case 'needs_identifier':
          // Check if we need to initiate a saml flow
          if (res.supportedFirstFactors.some(ff => ff.strategy === 'saml')) {
            await authenticateWithSaml();
          }
          break;
        case 'needs_first_factor':
          return navigate('factor-one');
        case 'needs_second_factor':
          return navigate('factor-two');
        case 'complete':
          return clerk.setActive({
            session: res.createdSessionId,
            beforeEmit: navigateAfterSignIn,
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

  const authenticateWithSaml = async () => {
    const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
    const redirectUrlComplete = ctx.afterSignInUrl || '/';

    return signIn.authenticateWithRedirect({
      strategy: 'saml',
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

    if (instantPasswordError) {
      await signInWithFields(identifierField);
    } else if (alreadySignedInError) {
      const sid = alreadySignedInError.meta!.sessionId!;
      await clerk.setActive({ session: sid, beforeEmit: navigateAfterSignIn });
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

  if (status.isLoading) {
    return <LoadingCard />;
  }

  // @ts-expect-error `action` is not typed
  const { action, ...identifierFieldProps } = identifierField.props;
  return (
    <Flow.Part part='start'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.start.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.start.subtitle')} />
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
          <Card.Action elementId='signIn'>
            <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('signIn.start.actionLink')}
              to={clerk.buildUrlWithAuth(signUpUrl)}
            />
          </Card.Action>
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
        const autofilled = window.getComputedStyle(ref.current, ':autofill').animationName === 'onAutoFillStart';
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
