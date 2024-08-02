import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { EmailField } from '~/common/email-field';
import { FirstNameField } from '~/common/first-name-field';
import { GlobalError } from '~/common/global-error';
import { LastNameField } from '~/common/last-name-field';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { UsernameField } from '~/common/username-field';
import { useAttributes } from '~/hooks/use-attributes';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';

export function SignUpContinue() {
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { enabled: firstNameEnabled, required: firstNameRequired } = useAttributes('first_name');
  const { enabled: lastNameEnabled, required: lastNameRequired } = useAttributes('last_name');
  const { enabled: usernameEnabled, required: usernameRequired } = useAttributes('username');
  const { enabled: phoneNumberEnabled, required: phoneNumberRequired } = useAttributes('phone_number');
  const { enabled: passwordEnabled, required: passwordRequired } = useAttributes('password');
  const { branded, applicationName, homeUrl, logoImageUrl } = useDisplayConfig();

  const isDev = isDevelopmentOrStaging();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignUp.Step name='continue'>
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
                  <Card.Title>{t('signUp.continue.title')}</Card.Title>
                  <Card.Description>{t('signUp.continue.subtitle')}</Card.Description>
                </Card.Header>

                <GlobalError />

                <Card.Body>
                  <div className='space-y-4'>
                    {firstNameEnabled && lastNameEnabled ? (
                      <div className='flex gap-4'>
                        <FirstNameField
                          required={firstNameRequired}
                          disabled={isGlobalLoading}
                        />
                        <LastNameField
                          required={lastNameRequired}
                          disabled={isGlobalLoading}
                        />
                      </div>
                    ) : null}

                    {usernameEnabled ? (
                      <UsernameField
                        required={usernameRequired}
                        disabled={isGlobalLoading}
                      />
                    ) : null}

                    {phoneNumberEnabled ? (
                      <PhoneNumberField
                        required={phoneNumberRequired}
                        disabled={isGlobalLoading}
                      />
                    ) : null}

                    <EmailField disabled={isGlobalLoading} />

                    {passwordEnabled && passwordRequired ? (
                      <PasswordField
                        validatePassword
                        label={t('formFieldLabel__password')}
                        required={passwordRequired}
                        disabled={isGlobalLoading}
                      />
                    ) : null}
                  </div>
                </Card.Body>
                <Common.Loading scope='step:continue'>
                  {isSubmitting => {
                    return (
                      <Card.Actions>
                        <SignUp.Action
                          submit
                          asChild
                        >
                          <Button
                            busy={isSubmitting}
                            disabled={isGlobalLoading}
                            iconEnd={<Icon.CaretRightLegacy />}
                            spinnerWhenBusy
                          >
                            {t('formButtonPrimary')}
                          </Button>
                        </SignUp.Action>
                      </Card.Actions>
                    );
                  }}
                </Common.Loading>
                {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
              </Card.Content>
              <Card.Footer branded={branded}>
                <Card.FooterAction>
                  <Card.FooterActionText>
                    {t('signUp.continue.actionText')}{' '}
                    <Card.FooterActionLink href='/sign-in'>{t('signUp.continue.actionLink')}</Card.FooterActionLink>
                  </Card.FooterActionText>
                </Card.FooterAction>
              </Card.Footer>
            </Card.Root>
          </SignUp.Step>
        );
      }}
    </Common.Loading>
  );
}
