import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { CheckboxField } from '~/common/checkbox-field';
import { GlobalError } from '~/common/global-error';
import { PasswordField } from '~/common/password-field';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import { LinkButton } from '~/primitives/link';

export function SignInResetPassword() {
  const { t } = useLocalizations();

  const isDev = useDevModeWarning();
  const { logoProps, footerProps } = useCard();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignIn.Step name='reset-password'>
            <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
              <Card.Content>
                <Card.Header>
                  <Card.Logo {...logoProps} />
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
              <Card.Footer {...footerProps} />
            </Card.Root>
          </SignIn.Step>
        );
      }}
    </Common.Loading>
  );
}
