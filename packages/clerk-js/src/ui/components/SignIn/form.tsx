import { useClerk } from '@clerk/shared/react';
import type { ClerkAPIError, SignInCreateParams, SignInResource } from '@clerk/types';
import { useLayoutEffect, useMemo, useState } from 'react';

import { ERROR_CODES, SIGN_UP_MODES } from '../../../core/constants';
import { clerkInvalidFAPIResponse } from '../../../core/errors';
import {
  buildSSOCallbackURL,
  getIdentifierControlDisplayValues,
  groupIdentifiers,
  type SignInStartIdentifier,
} from '../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { Col, localizationKeys } from '../../customizables';
import type { CommonInputProps } from '../../elements';
import { Form } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { buildRequest, type FormControlState, handleError, isMobileDevice, useFormControl } from '../../utils';
import { handleCombinedFlowTransfer } from './handleCombinedFlowTransfer';
import { InstantPassword } from './InstantPassword';
import { useAutoFillPasskey } from './use-passkey-autofill';
import { getSignUpAttributeFromIdentifier } from './utils';

const components = {
  tel: Form.PhoneInput,
  password: Form.PasswordInput,
  text: Form.PlainInput,
  email: Form.PlainInput,
};

function DynamicField(props: CommonInputProps) {
  if (!props.type) {
    return null;
  }
  const FieldComponent = components[props.type as keyof typeof components];
  if (!FieldComponent) {
    return null;
  }
  return <FieldComponent {...props} />;
}

export function SignInStartForm() {
  const { displayConfig, userSettings } = useEnvironment();
  const signIn = useCoreSignIn();
  const clerk = useClerk();
  const supportEmail = useSupportEmail();

  /**
   * Passkeys
   */
  const { isWebAuthnAutofillSupported } = useAutoFillPasskey();

  const standardFormAttributes = userSettings.enabledFirstFactorIdentifiers;

  const signInContext = useSignInContext();
  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;
  const hasSocialOrWeb3Buttons = !!authenticatableSocialStrategies.length || !!web3FirstFactors.length;
  const [shouldAutofocus, setShouldAutofocus] = useState(!isMobileDevice() && !hasSocialOrWeb3Buttons);
  const [hasSwitchedByAutofill, setHasSwitchedByAutofill] = useState(false);

  const { navigate } = useRouter();

  const instantPasswordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__password'),
    placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
  });
  const identifierAttributes = useMemo<SignInStartIdentifier[]>(
    () => groupIdentifiers(userSettings.enabledFirstFactorIdentifiers),
    [userSettings.enabledFirstFactorIdentifiers],
  );

  const initialValues: Record<SignInStartIdentifier, string | undefined> = useMemo(
    () => ({
      email_address: signInContext.initialValues?.emailAddress,
      email_address_username: signInContext.initialValues?.emailAddress || signInContext.initialValues?.username,
      username: signInContext.initialValues?.username,
      phone_number: signInContext.initialValues?.phoneNumber,
    }),
    [signInContext.initialValues],
  );

  const onlyPhoneNumberInitialValueExists =
    !!initialValues?.phone_number && !(initialValues.email_address || initialValues.username);
  const shouldStartWithPhoneNumberIdentifier =
    onlyPhoneNumberInitialValueExists && identifierAttributes.includes('phone_number');
  const [identifierAttribute, setIdentifierAttribute] = useState<SignInStartIdentifier>(
    shouldStartWithPhoneNumberIdentifier ? 'phone_number' : identifierAttributes[0] || '',
  );

  const { currentIdentifier, nextIdentifier } = getIdentifierControlDisplayValues(
    identifierAttributes,
    identifierAttribute,
  );
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
            redirectUrl: signInContext.afterSignInUrl,
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

  const attemptToRecoverFromSignInError = async (e: any) => {
    if (!e.errors) {
      return;
    }
    const instantPasswordError: ClerkAPIError = e.errors.find(
      (e: ClerkAPIError) =>
        e.code === ERROR_CODES.INVALID_STRATEGY_FOR_USER ||
        e.code === ERROR_CODES.FORM_PASSWORD_INCORRECT ||
        e.code === ERROR_CODES.FORM_PASSWORD_PWNED,
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
      await clerk.setActive({ session: sid, redirectUrl: signInContext.afterSignInUrl });
    } else if (signInContext.isCombinedFlow && accountDoesNotExistError) {
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

      const redirectUrl = buildSSOCallbackURL(signInContext, displayConfig.signUpUrl);
      const redirectUrlComplete = signInContext.afterSignUpUrl || '/';

      return handleCombinedFlowTransfer({
        afterSignUpUrl: signInContext.afterSignUpUrl || '/',
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

  const authenticateWithEnterpriseSSO = async () => {
    const redirectUrl = buildSSOCallbackURL(signInContext, displayConfig.signInUrl);
    const redirectUrlComplete = signInContext.afterSignInUrl || '/';

    return signIn.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
    });
  };

  if (standardFormAttributes.length === 0) {
    return null;
  }

  // @ts-expect-error `action` is not typed
  const { action, ...identifierFieldProps } = identifierField.props;
  return (
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
        <InstantPassword field={userSettings.instanceIsPasswordBased ? instantPasswordField : undefined} />
      </Col>
      <Form.SubmitButton hasArrow />
    </Form.Root>
  );
}
