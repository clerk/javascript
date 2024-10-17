import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import { useClerk } from '@clerk/shared/react';

import { Connections } from '~/common/connections';
import { EmailField } from '~/common/email-field';
import { EmailOrPhoneNumberField } from '~/common/email-or-phone-number-field';
import { FirstNameField } from '~/common/first-name-field';
import { GlobalError } from '~/common/global-error';
import { LastNameField } from '~/common/last-name-field';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { RouterLink } from '~/common/router-link';
import { UsernameField } from '~/common/username-field';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/contexts';
import { useSignUpAttributes } from '~/hooks/use-attributes';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { useOptions } from '~/hooks/use-options';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import CaretRightLegacySm from '~/primitives/icons/caret-right-legacy-sm';
import { Separator } from '~/primitives/separator';

export function SignUpStart() {
  const clerk = useClerk();
  const { signInUrl } = useOptions();
  const enabledConnections = useEnabledConnections();
  const { userSettings } = useEnvironment();
  const { t } = useLocalizations();
  const { required: firstNameRequired, show: showFirstName } = useSignUpAttributes('first_name');
  const { required: lastNameRequired, show: showLastName } = useSignUpAttributes('last_name');
  const { enabled: usernameEnabled, required: usernameRequired, show: showUserName } = useSignUpAttributes('username');
  const {
    enabled: phoneNumberEnabled,
    required: phoneNumberRequired,
    show: showPhoneNumber,
  } = useSignUpAttributes('phone_number');
  const {
    enabled: emailAddressEnabled,
    required: emailAddressRequired,
    show: showEmailAddress,
  } = useSignUpAttributes('email_address');
  const { required: passwordRequired, show: showPassword } = useSignUpAttributes('password');
  const { applicationName } = useDisplayConfig();

  const hasConnection = enabledConnections.length > 0;
  const hasIdentifier = emailAddressEnabled || usernameEnabled || phoneNumberEnabled;
  const isDev = useDevModeWarning();
  const { options } = useAppearance().parsedAppearance;
  const { logoProps, footerProps } = useCard();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        const connectionsWithSeperator = [
          <Connections
            key='connections'
            disabled={isGlobalLoading}
          />,
          hasConnection && hasIdentifier ? <Separator key='separator'>{t('dividerText')}</Separator> : null,
        ];
        return (
          <SignUp.Step
            asChild
            name='start'
          >
            <Card.Root
              as='form'
              banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}
            >
              <Card.Content>
                <Card.Header>
                  <Card.Logo {...logoProps} />
                  <Card.Title>{t('signUp.start.title')}</Card.Title>
                  <Card.Description>
                    {t('signUp.start.subtitle', {
                      applicationName,
                    })}
                  </Card.Description>
                </Card.Header>

                <GlobalError />

                <Card.Body>
                  {options.socialButtonsPlacement === 'top' ? connectionsWithSeperator : null}

                  {hasIdentifier ? (
                    <div className='flex flex-col gap-4'>
                      {showFirstName && showLastName ? (
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

                      {showUserName ? (
                        <UsernameField
                          required={usernameRequired}
                          disabled={isGlobalLoading}
                        />
                      ) : null}

                      {emailAddressEnabled && !emailAddressRequired && phoneNumberEnabled && !phoneNumberRequired ? (
                        <EmailOrPhoneNumberField
                          toggleLabelEmail={t('signUp.start.actionLink__use_email')}
                          toggleLabelPhoneNumber={t('signUp.start.actionLink__use_phone')}
                        />
                      ) : (
                        <>
                          {showEmailAddress ? <EmailField disabled={isGlobalLoading} /> : null}

                          {showPhoneNumber ? (
                            <PhoneNumberField
                              required={phoneNumberRequired}
                              disabled={isGlobalLoading}
                              initPhoneWithCode={clerk.client.signUp.phoneNumber || ''}
                            />
                          ) : null}
                        </>
                      )}

                      {showPassword ? (
                        <PasswordField
                          validatePassword
                          label={t('formFieldLabel__password')}
                          required={passwordRequired}
                          disabled={isGlobalLoading}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {options.socialButtonsPlacement === 'bottom' ? connectionsWithSeperator.reverse() : null}

                  {userSettings.signUp.captcha_enabled ? <SignUp.Captcha className='empty:hidden' /> : null}
                </Card.Body>
                {hasConnection || hasIdentifier ? (
                  <Card.Actions>
                    <Common.Loading scope='submit'>
                      {isSubmitting => {
                        return (
                          <SignUp.Action
                            submit
                            asChild
                          >
                            <Button
                              busy={isSubmitting}
                              disabled={isGlobalLoading}
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignUp.Action>
                        );
                      }}
                    </Common.Loading>
                  </Card.Actions>
                ) : null}
              </Card.Content>
              <Card.Footer {...footerProps}>
                <Card.FooterAction>
                  <Card.FooterActionText>
                    {t('signUp.start.actionText')}{' '}
                    <RouterLink
                      asChild
                      href={clerk.buildUrlWithAuth(signInUrl || '/sign-in')}
                    >
                      <Card.FooterActionLink>{t('signUp.start.actionLink')}</Card.FooterActionLink>
                    </RouterLink>
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
