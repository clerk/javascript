import { inertProps } from '@clerk/shared/inert';

import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { SocialButtonsReversibleContainerWithDivider } from '@/ui/elements/ReversibleContainer';

import { ActionBlockedCard } from '../../common';
import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import { CaptchaElement } from '../../elements/CaptchaElement';
import type { useSignUpStartController } from './sign-up-start.controller';
import { SignUpForm } from './SignUpForm';
import { SignUpRestrictedAccess } from './SignUpRestrictedAccess';
import { SignUpSocialButtons } from './SignUpSocialButtons';
import { SignUpStartAlternativePhoneCodePhoneNumberCard } from './SignUpStartAlternativePhoneCodePhoneNumberCard';

export const SignUpStartView = ({
  isLoading,
  blockedDetails,
  isRestricted,
  alternativePhoneCodeProvider,
  captchaIsInteractive,
  onCaptchaInteractiveChange,
  error,
  fields,
  formState,
  handleSubmit,
  handleChangeActive,
  canToggleEmailPhone,
  shouldShowForm,
  showOauthProviders,
  showWeb3Providers,
  showAlternativePhoneCodeProviders,
  onAlternativePhoneCodeProviderClick,
  onAlternativePhoneCodeUseAnotherMethod,
  missingRequirementsWithTicket,
  isCombinedFlow,
  signInHref,
}: ReturnType<typeof useSignUpStartController>): JSX.Element => {
  if (isLoading) {
    return <LoadingCard />;
  }

  if (blockedDetails) {
    return <ActionBlockedCard details={blockedDetails} />;
  }

  if (isRestricted) {
    return <SignUpRestrictedAccess />;
  }

  return (
    <Flow.Part part='start'>
      {!alternativePhoneCodeProvider ? (
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title
                localizationKey={
                  isCombinedFlow
                    ? localizationKeys('signUp.start.titleCombined')
                    : localizationKeys('signUp.start.title')
                }
              />
              <Header.Subtitle
                localizationKey={
                  isCombinedFlow
                    ? localizationKeys('signUp.start.subtitleCombined')
                    : localizationKeys('signUp.start.subtitle')
                }
              />
            </Header.Root>
            <Card.Alert>{error}</Card.Alert>
            <Flex
              direction='col'
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
                {(showOauthProviders || showWeb3Providers || showAlternativePhoneCodeProviders) && (
                  <SignUpSocialButtons
                    enableOAuthProviders={showOauthProviders}
                    enableWeb3Providers={showWeb3Providers}
                    enableAlternativePhoneCodeProviders={showAlternativePhoneCodeProviders}
                    onAlternativePhoneCodeProviderClick={onAlternativePhoneCodeProviderClick}
                    continueSignUp={missingRequirementsWithTicket}
                    legalAccepted={Boolean(formState.legalAccepted.checked) || undefined}
                  />
                )}
                {shouldShowForm && (
                  <SignUpForm
                    handleSubmit={handleSubmit}
                    fields={fields}
                    formState={formState}
                    canToggleEmailPhone={canToggleEmailPhone}
                    handleEmailPhoneToggle={handleChangeActive}
                  />
                )}
              </SocialButtonsReversibleContainerWithDivider>
            </Flex>
            <CaptchaElement
              gapless
              onInteractiveChange={onCaptchaInteractiveChange}
            />
          </Card.Content>

          <Card.Footer>
            <Card.Action elementId='signUp'>
              <Card.ActionText localizationKey={localizationKeys('signUp.start.actionText')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signUp.start.actionLink')}
                to={isCombinedFlow ? '../' : signInHref}
              />
            </Card.Action>
          </Card.Footer>
        </Card.Root>
      ) : (
        <SignUpStartAlternativePhoneCodePhoneNumberCard
          handleSubmit={handleSubmit}
          fields={fields}
          formState={formState}
          onUseAnotherMethod={onAlternativePhoneCodeUseAnotherMethod}
          phoneCodeProvider={alternativePhoneCodeProvider}
          error={error}
        />
      )}
    </Flow.Part>
  );
};
