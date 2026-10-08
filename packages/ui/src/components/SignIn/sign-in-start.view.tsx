import { inertProps } from '@clerk/shared/inert';
import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { SocialButtonsReversibleContainerWithDivider } from '@/ui/elements/ReversibleContainer';

import { ActionBlockedCard } from '../../common';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import { InstantPasswordRow } from './InstantPasswordRow';
import type { useSignInStartController } from './sign-in-start.controller';
import { SignInAlternativePhoneCodePhoneNumberCard } from './SignInAlternativePhoneCodePhoneNumberCard';
import { SignInSocialButtons } from './SignInSocialButtons';

export const SignInStartView = (controller: ReturnType<typeof useSignInStartController>): JSX.Element => {
  if (controller.kind === 'loading') {
    return <LoadingCard />;
  }
  if (controller.kind === 'blocked') {
    return <ActionBlockedCard details={controller.blockedDetails} />;
  }

  const {
    alternativePhoneCodeProvider,
    captchaIsInteractive,
    setCaptchaIsInteractive,
    hasSocialOrWeb3Buttons,
    showAlternativePhoneCodeProviders,
    onAlternativePhoneCodeProviderClick,
    standardFormAttributes,
    handleFirstPartySubmit,
    identifierField,
    DynamicField,
    nextIdentifier,
    switchToNextIdentifier,
    identifierFieldProps,
    shouldAutofocus,
    isWebAuthnAutofillSupported,
    isIdentifierLastAuthenticationStrategy,
    passwordBasedInstance,
    instantPasswordField,
    handleForgotPasswordClick,
    signUpMode,
    passkeyEnabled,
    showPasskeySignInButton,
    isWebSupported,
    authenticateWithPasskey,
    isCombinedFlow,
    phoneIdentifierField,
    onAlternativePhoneCodeUseAnotherMethod,
  } = controller;

  return (
    <Flow.Part part='start'>
      {!alternativePhoneCodeProvider ? (
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title
                localizationKey={
                  isCombinedFlow
                    ? localizationKeys('signIn.start.titleCombined')
                    : localizationKeys('signIn.start.title')
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
            <Card.Alert>{controller.cardError}</Card.Alert>
            {/*TODO: extract main in its own component */}
            <Col
              elementDescriptor={descriptors.main}
              gap={6}
              {...inertProps(captchaIsInteractive)}
              // `display:none` (not `visibility:hidden`) so the collapsed column leaves flex flow and
              // contributes no `gap` gutter to `Card.Content` — otherwise it injects empty space above
              // the spotlighted captcha. Subtree stays mounted (form state preserved); `inert` is then
              // redundant-but-harmless.
              sx={captchaIsInteractive ? { display: 'none' } : undefined}
            >
              <SocialButtonsReversibleContainerWithDivider>
                {hasSocialOrWeb3Buttons && (
                  <SignInSocialButtons
                    enableWeb3Providers
                    enableOAuthProviders
                    enableAlternativePhoneCodeProviders={showAlternativePhoneCodeProviders}
                    onAlternativePhoneCodeProviderClick={onAlternativePhoneCodeProviderClick}
                  />
                )}
                {standardFormAttributes.length ? (
                  <Form.Root
                    key={controller.formKey}
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
                          isLastAuthenticationStrategy={isIdentifierLastAuthenticationStrategy}
                        />
                      </Form.ControlRow>
                      <InstantPasswordRow
                        field={passwordBasedInstance ? instantPasswordField : undefined}
                        onForgotPasswordClick={event => {
                          void handleForgotPasswordClick(event);
                        }}
                      />
                    </Col>
                    <Col center>
                      <Form.SubmitButton hasArrow />
                    </Col>
                  </Form.Root>
                ) : null}
              </SocialButtonsReversibleContainerWithDivider>
            </Col>
            <CaptchaElement
              gapless
              onInteractiveChange={setCaptchaIsInteractive}
            />
            {/* Kept outside descriptors.main so the spotlight's `inert` leaves this alternative action reachable. */}
            {passkeyEnabled && showPasskeySignInButton && isWebSupported && (
              <Card.Action elementId={'usePasskey'}>
                <Card.ActionLink
                  localizationKey={localizationKeys('signIn.start.actionLink__use_passkey')}
                  onClick={() => {
                    void authenticateWithPasskey({ flow: 'discoverable' });
                  }}
                />
              </Card.Action>
            )}
          </Card.Content>
          <Card.Footer>
            {signUpMode === SIGN_UP_MODES.PUBLIC && !isCombinedFlow && (
              <Card.Action elementId='signIn'>
                <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText')} />
                <Card.ActionLink
                  localizationKey={localizationKeys('signIn.start.actionLink')}
                  to={controller.signUpHref}
                />
              </Card.Action>
            )}
            {signUpMode === SIGN_UP_MODES.WAITLIST && (
              <Card.Action elementId='signIn'>
                <Card.ActionText localizationKey={localizationKeys('signIn.start.actionText__join_waitlist')} />
                <Card.ActionLink
                  localizationKey={localizationKeys('signIn.start.actionLink__join_waitlist')}
                  to={controller.waitlistHref}
                />
              </Card.Action>
            )}
          </Card.Footer>
        </Card.Root>
      ) : (
        <SignInAlternativePhoneCodePhoneNumberCard
          key={controller.formKey}
          error={controller.cardError}
          handleSubmit={handleFirstPartySubmit}
          phoneNumberFormState={phoneIdentifierField}
          onUseAnotherMethod={onAlternativePhoneCodeUseAnotherMethod}
          phoneCodeProvider={alternativePhoneCodeProvider}
        />
      )}
    </Flow.Part>
  );
};
