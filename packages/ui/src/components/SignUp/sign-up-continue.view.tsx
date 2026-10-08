import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { SocialButtonsReversibleContainerWithDivider } from '@/ui/elements/ReversibleContainer';

import { descriptors, Flex, Flow, localizationKeys } from '../../customizables';
import type { useSignUpContinueController } from './sign-up-continue.controller';
import { SignUpForm } from './SignUpForm';
import { SignUpSocialButtons } from './SignUpSocialButtons';

export const SignUpContinueView = ({
  fields,
  formState,
  error,
  handleSubmit,
  handleChangeActive,
  canToggleEmailPhone,
  showOauthProviders,
  onlyLegalConsentMissing,
  isCombinedFlow,
  signInHref,
  headerTitle,
  headerSubtitle,
}: ReturnType<typeof useSignUpContinueController>): JSX.Element => {
  if (!fields) {
    return <LoadingCard />;
  }

  return (
    <Flow.Part part='complete'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={headerTitle} />
            <Header.Subtitle localizationKey={headerSubtitle} />
          </Header.Root>
          <Card.Alert>{error}</Card.Alert>
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={8}
          >
            <SocialButtonsReversibleContainerWithDivider>
              {showOauthProviders && !onlyLegalConsentMissing && (
                <SignUpSocialButtons
                  enableOAuthProviders={showOauthProviders}
                  enableWeb3Providers={false}
                  enableAlternativePhoneCodeProviders={false}
                  continueSignUp
                />
              )}
              <SignUpForm
                handleSubmit={handleSubmit}
                fields={fields}
                formState={formState}
                onlyLegalAcceptedMissing={onlyLegalConsentMissing}
                canToggleEmailPhone={canToggleEmailPhone}
                handleEmailPhoneToggle={handleChangeActive}
              />
            </SocialButtonsReversibleContainerWithDivider>
          </Flex>
        </Card.Content>

        <Card.Footer>
          {!isCombinedFlow ? (
            <Card.Action elementId='signUp'>
              <Card.ActionText localizationKey={localizationKeys('signUp.continue.actionText')} />
              <Card.ActionLink
                localizationKey={localizationKeys('signUp.continue.actionLink')}
                to={isCombinedFlow ? '../../' : signInHref}
              />
            </Card.Action>
          ) : null}
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
};
