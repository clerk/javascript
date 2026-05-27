import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import type { PhoneCodeChannel } from '@clerk/shared/types';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { SocialButtonsReversibleContainerWithDivider } from '@/ui/elements/ReversibleContainer';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import type { SignInStartEvent, SignInStartState } from './signInStartMachine';
import { SignInAlternativePhoneCodePhoneNumberCard } from './SignInAlternativePhoneCodePhoneNumberCard';
import { SignInSocialButtons } from './SignInSocialButtons';
import type { SignInStartViewConfig } from './useSignInStartFlow';

export type SignInStartViewProps = {
  state: SignInStartState;
  dispatch: (event: SignInStartEvent) => void;
  onSubmit: () => Promise<void>;
  config: SignInStartViewConfig;
  identifierField: FormControlState<'identifier'>;
  phoneIdentifierField: FormControlState<'identifier'>;
  instantPasswordField: FormControlState<'password'>;
  authenticateWithPasskey: (opts: { flow: string }) => Promise<void>;
  signUpUrlWithAuth: string;
  waitlistUrlWithAuth: string;
};

export function SignInStartView({
  state,
  dispatch,
  onSubmit,
  config,
  identifierField,
  phoneIdentifierField,
  instantPasswordField,
  authenticateWithPasskey,
  signUpUrlWithAuth,
  waitlistUrlWithAuth,
}: SignInStartViewProps) {
  if (state.screen === 'loading') {
    return <LoadingCard />;
  }

  const handleFirstPartySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void onSubmit();
  };

  const onAlternativePhoneCodeProviderClick = (phoneCodeChannel: PhoneCodeChannel) => {
    const provider: PhoneCodeChannelData | null = getAlternativePhoneCodeProviderData(phoneCodeChannel) || null;
    if (provider) {
      dispatch({ type: 'SELECT_ALT_PHONE_PROVIDER', provider });
    }
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

  // @ts-expect-error `action` is not typed
  const { action, validLastAuthenticationStrategies, ...identifierFieldProps } = identifierField.props;

  if (state.screen === 'alternativePhoneCode' && state.alternativePhoneCodeProvider) {
    return (
      <Flow.Part part='start'>
        <SignInAlternativePhoneCodePhoneNumberCard
          handleSubmit={handleFirstPartySubmit}
          phoneNumberFormState={phoneIdentifierField}
          onUseAnotherMethod={() => dispatch({ type: 'CLEAR_ALT_PHONE_PROVIDER' })}
          phoneCodeProvider={state.alternativePhoneCodeProvider}
        />
      </Flow.Part>
    );
  }

  return (
    <Flow.Part part='start'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title
              localizationKey={
                config.isCombinedFlow
                  ? localizationKeys('signIn.start.titleCombined')
                  : localizationKeys('signIn.start.title')
              }
            />
            <Header.Subtitle
              localizationKey={
                config.isCombinedFlow
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
          <Card.Alert>{state.cardError}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <SocialButtonsReversibleContainerWithDivider>
              {config.hasSocialOrWeb3Buttons && (
                <SignInSocialButtons
                  enableWeb3Providers
                  enableOAuthProviders
                  enableAlternativePhoneCodeProviders={config.showAlternativePhoneCodeProviders}
                  onAlternativePhoneCodeProviderClick={onAlternativePhoneCodeProviderClick}
                />
              )}
              {config.standardFormAttributes.length ? (
                <Form.Root
                  onSubmit={handleFirstPartySubmit}
                  gap={8}
                >
                  <Col gap={6}>
                    <Form.ControlRow elementId={identifierField.id}>
                      <DynamicField
                        actionLabel={config.nextIdentifier?.action}
                        onActionClicked={() => dispatch({ type: 'SWITCH_IDENTIFIER' })}
                        {...identifierFieldProps}
                        autoFocus={state.shouldAutofocus}
                        autoComplete={config.isWebAuthnAutofillSupported ? 'webauthn' : undefined}
                        isLastAuthenticationStrategy={config.isIdentifierLastAuthenticationStrategy}
                      />
                    </Form.ControlRow>
                    <InstantPasswordRow field={config.passwordBasedInstance ? instantPasswordField : undefined} />
                  </Col>
                  <Col center>
                    <CaptchaElement />
                    <Form.SubmitButton hasArrow />
                  </Col>
                </Form.Root>
              ) : null}
            </SocialButtonsReversibleContainerWithDivider>
            {!config.standardFormAttributes.length && <CaptchaElement />}
            {config.showPasskeyButton && config.isWebSupported && (
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
          {config.signUpMode === SIGN_UP_MODES.PUBLIC && !config.isCombinedFlow && (
            <Card.Action elementId='signIn'>
              <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signIn.start.actionLink')}
                to={signUpUrlWithAuth}
              />
            </Card.Action>
          )}
          {config.signUpMode === SIGN_UP_MODES.WAITLIST && (
            <Card.Action elementId='signIn'>
              <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText__join_waitlist')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signIn.start.actionLink__join_waitlist')}
                to={waitlistUrlWithAuth}
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

  useLayoutEffect(() => {
    const intervalId = setInterval(() => {
      if (ref?.current) {
        const autofilled =
          window.getComputedStyle(ref.current, ':autofill').animationName === 'onAutoFillStart' ||
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
