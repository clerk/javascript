import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { CheckboxField } from '~/common/checkbox-field';
import { GlobalError } from '~/common/global-error';
import { PasswordField } from '~/common/password-field';
import { useAppearance } from '~/hooks/use-appearance';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import { LinkButton } from '~/primitives/link';

export function SignInResetPassword() {
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const isDev = isDevelopmentOrStaging();
  const cardFooterProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  return (
    <Common.Loading>
      {isGlobalLoading => {
        return (
          <SignIn.Step name='reset-password'>
            <Card.Root>
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

                <Common.Loading>
                  {isSubmitting => {
                    return (
                      <Card.Actions>
                        <SignIn.Action
                          submit
                          asChild
                        >
                          <Button
                            busy={isSubmitting}
                            disabled={isGlobalLoading || isSubmitting}
                          >
                            {t('signIn.resetPassword.formButtonPrimary')}
                          </Button>
                        </SignIn.Action>

                        <SignIn.Action
                          navigate='start'
                          asChild
                        >
                          <LinkButton>{t('backButton')}</LinkButton>
                        </SignIn.Action>
                      </Card.Actions>
                    );
                  }}
                </Common.Loading>
                {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
              </Card.Content>
              <Card.Footer {...cardFooterProps} />
            </Card.Root>
          </SignIn.Step>
        );
      }}
    </Common.Loading>
  );
}
