import { useClerk } from '@clerk/shared/react';
import type { ClerkAPIError, SignInCreateParams, SignInResource } from '@clerk/types';

import { ERROR_CODES } from '../../../../core/constants';
import { clerkInvalidFAPIResponse } from '../../../../core/errors';
import { buildSSOCallbackURL } from '../../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../../contexts';
import { Col } from '../../../customizables';
import type { CommonInputProps } from '../../../elements';
import { Form } from '../../../elements';
import { useSupportEmail } from '../../../hooks/useSupportEmail';
import { useRouter } from '../../../router';
import type { FieldStateProps } from '../../../utils';
import { buildRequest, useForm } from '../../../utils';
import { InstantPassword } from '../InstantPassword';
import { useAutoFillPasskey } from '../use-passkey-autofill';
import { useSignInStartErrorHandler } from './recover-start-error';
import { useIdentifierField } from './use-identifier-field';

const components = {
  tel: Form.PhoneInput,
  password: Form.PasswordInput,
  text: Form.PlainInput,
  email: Form.PlainInput,
};

const isInstantPasswordError = (e: any) =>
  e.errors.find(
    (e: ClerkAPIError) =>
      e.code === ERROR_CODES.INVALID_STRATEGY_FOR_USER ||
      e.code === ERROR_CODES.FORM_PASSWORD_INCORRECT ||
      e.code === ERROR_CODES.FORM_PASSWORD_PWNED,
  );

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
  const signInContext = useSignInContext();
  const { navigate } = useRouter();

  /**
   * Passkeys
   */
  const { isWebAuthnAutofillSupported } = useAutoFillPasskey();

  /**
   * Identifier Field
   */
  const { nextIdentifier, switchToNextIdentifier, identifierField, shouldAutofocus } = useIdentifierField();

  /**
   * Form Store
   */
  const formStore = useForm('sign-in-start');

  const attemptToRecoverFromSignInError = useSignInStartErrorHandler();

  const safePasswordSignInForEnterpriseSSOInstance = (
    signInCreatePromise: Promise<SignInResource>,
    fields: Array<FieldStateProps<string>>,
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

  const buildSignInParams = (fields: Array<FieldStateProps<string>>): SignInCreateParams => {
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

  const signInWithFields = async (...fields: Array<FieldStateProps<string>>) => {
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
      if (isInstantPasswordError(e)) {
        // Retry without the instant password field
        return await signInWithFields(formStore.getState(a => a.identifier));
      }

      return attemptToRecoverFromSignInError(e);
    }
  };

  const handleFirstPartySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return signInWithFields(
      formStore.getState(a => a.identifier),
      formStore.getState(a => a.password),
    );
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

  if (userSettings.enabledFirstFactorIdentifiers.length === 0) {
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
        <InstantPassword />
      </Col>
      <Form.SubmitButton hasArrow />
    </Form.Root>
  );
}
