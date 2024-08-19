import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { CheckboxField } from '~/common/checkbox-field';
import { GlobalError } from '~/common/global-error';
import { PasswordField } from '~/common/password-field';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/contexts';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import { LinkButton } from '~/primitives/link';

export function SignInResetPassword() {
  const { t } = useLocalizations();
  const { layout } = useAppearance().parsedAppearance;
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const isDev = useDevModeWarning();
  const cardFooterProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignIn.Step name='reset-password'>
            <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
              <Card.Content>
                <Card.Header>
                  {logoImageUrl ? (
                    <Card.Logo
                      href={homeUrl}
                      src={logoImageUrl}
                      alt={applicationName}
                    />
                  ) : null}
                  <Card.Title>{t('signIn.resetPassword.title')}</Card.Title>
                </Card.Header>

                <GlobalError />

                <Card.Body>
                  <div className='flex flex-col justify-center gap-4'>
                    <PasswordField
                      validatePassword
                      name='password'
                      label={t('formFieldLabel__newPassword')}
                    />
                    <PasswordField
                      name='confirmPassword'
                      label={t('formFieldLabel__confirmPassword')}
                    />

                    <CheckboxField
                      name='signOutOfOtherSessions'
                      label={t('formFieldLabel__signOutOfOtherSessions')}
                      defaultChecked
                    />
                  </div>
                </Card.Body>

                <Card.Actions>
                  <Common.Loading scope='submit'>
                    {isSubmitting => {
                      return (
                        <SignIn.Action
                          submit
                          asChild
                        >
                          <Button
                            busy={isSubmitting}
                            disabled={isGlobalLoading}
                          >
                            {t('signIn.resetPassword.formButtonPrimary')}
                          </Button>
                        </SignIn.Action>
                      );
                    }}
                  </Common.Loading>

                  <SignIn.Action
                    navigate='start'
                    asChild
                  >
                    <LinkButton>{t('backButton')}</LinkButton>
                  </SignIn.Action>
                </Card.Actions>
              </Card.Content>
              <Card.Footer {...cardFooterProps} />
            </Card.Root>
          </SignIn.Step>
        );
      }}
    </Common.Loading>
  );
}
