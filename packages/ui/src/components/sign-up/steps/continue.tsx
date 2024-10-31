import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import { useClerk } from '@clerk/shared/react';

import { EmailField } from '~/common/email-field';
import { FirstNameField } from '~/common/first-name-field';
import { GlobalError } from '~/common/global-error';
import { LastNameField } from '~/common/last-name-field';
import { LegalAcceptedField } from '~/common/legal-accepted';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { RouterLink } from '~/common/router-link';
import { UsernameField } from '~/common/username-field';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAttributes } from '~/hooks/use-attributes';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { useOptions } from '~/hooks/use-options';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import CaretRightLegacySm from '~/primitives/icons/caret-right-legacy-sm';

export function SignUpContinue() {
  const clerk = useClerk();
  const { signInUrl } = useOptions();
  const { t } = useLocalizations();
  const environment = useEnvironment();
  const { client } = useClerk();
  const { missingFields } = client.signUp;
  const { enabled: firstNameEnabled, required: firstNameRequired } = useAttributes('first_name');
  const { enabled: lastNameEnabled, required: lastNameRequired } = useAttributes('last_name');
  const { enabled: usernameEnabled, required: usernameRequired } = useAttributes('username');
  const { enabled: phoneNumberEnabled, required: phoneNumberRequired } = useAttributes('phone_number');
  const { enabled: passwordEnabled, required: passwordRequired } = useAttributes('password');
  const legalConsentEnabled = environment.userSettings.signUp.legal_consent_enabled;
  const legalConsentMissing = missingFields.includes('legal_accepted');
  const showFirstName = firstNameEnabled && firstNameRequired && missingFields.includes('first_name');
  const showLastName = lastNameEnabled && lastNameRequired && missingFields.includes('last_name');
  const showUserName = usernameEnabled && usernameRequired && missingFields.includes('username');
  const showPhoneNumber = phoneNumberEnabled && phoneNumberRequired && missingFields.includes('phone_number');
  const showPassword = passwordEnabled && passwordRequired && missingFields.includes('password');
  const showEmail = missingFields.includes('email_address');
  const showLegalConsent = legalConsentEnabled && legalConsentMissing;
  const isDev = useDevModeWarning();
  const { logoProps, footerProps } = useCard();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignUp.Step
            asChild
            name='continue'
          >
            <Card.Root
              as='form'
              banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}
            >
              <Card.Content>
                <Card.Header>
                  <Card.Logo {...logoProps} />
                  <Card.Title>{t('signUp.continue.title')}</Card.Title>
                  <Card.Description>{t('signUp.continue.subtitle')}</Card.Description>
                </Card.Header>

                <GlobalError />

                <Card.Body>
                  <div className='flex flex-col gap-y-4'>
                    {showFirstName && showLastName ? (
                      <div className='flex gap-4 empty:hidden'>
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

                    {showPhoneNumber ? (
                      <PhoneNumberField
                        required={phoneNumberRequired}
                        disabled={isGlobalLoading}
                      />
                    ) : null}

                    {showEmail && <EmailField disabled={isGlobalLoading} />}

                    {showPassword ? (
                      <PasswordField
                        validatePassword
                        label={t('formFieldLabel__password')}
                        required={passwordRequired}
                        disabled={isGlobalLoading}
                      />
                    ) : null}

                    {showLegalConsent && <LegalAcceptedField />}
                  </div>
                </Card.Body>
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
              </Card.Content>
              <Card.Footer {...footerProps}>
                <Card.FooterAction>
                  <Card.FooterActionText>
                    {t('signUp.continue.actionText')}{' '}
                    <RouterLink
                      asChild
                      href={clerk.buildUrlWithAuth(signInUrl || '/sign-in')}
                    >
                      <Card.FooterActionLink>{t('signUp.continue.actionLink')}</Card.FooterActionLink>
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
