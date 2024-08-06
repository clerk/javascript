import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { EmailField } from '~/common/email-field';
import { FirstNameField } from '~/common/first-name-field';
import { GlobalError } from '~/common/global-error';
import { LastNameField } from '~/common/last-name-field';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { UsernameField } from '~/common/username-field';
import { useAppearance } from '~/hooks/use-appearance';
import { useAttributes } from '~/hooks/use-attributes';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';

export function SignUpContinue() {
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const { enabled: firstNameEnabled, required: firstNameRequired } = useAttributes('first_name');
  const { enabled: lastNameEnabled, required: lastNameRequired } = useAttributes('last_name');
  const { enabled: usernameEnabled, required: usernameRequired } = useAttributes('username');
  const { enabled: phoneNumberEnabled, required: phoneNumberRequired } = useAttributes('phone_number');
  const { enabled: passwordEnabled, required: passwordRequired } = useAttributes('password');
  const { branded, applicationName, homeUrl, logoImageUrl } = useDisplayConfig();
  const renderDevModeWarning = useDevModeWarning();
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
                          >
                            {t('formButtonPrimary')}
                          </Button>
                        </SignUp.Action>
                      </Card.Actions>
                    );
                  }}
                </Common.Loading>
                {renderDevModeWarning ? <Card.Banner>Development mode</Card.Banner> : null}
              </Card.Content>
              <Card.Footer {...cardFooterProps}>
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
