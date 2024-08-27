import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { Connections } from '~/common/connections';
import { EmailField } from '~/common/email-field';
import { EmailOrPhoneNumberField } from '~/common/email-or-phone-number-field';
import { EmailOrUsernameField } from '~/common/email-or-username-field';
import { EmailOrUsernameOrPhoneNumberField } from '~/common/email-or-username-or-phone-number-field';
import { GlobalError } from '~/common/global-error';
import { PhoneNumberField } from '~/common/phone-number-field';
import { PhoneNumberOrUsernameField } from '~/common/phone-number-or-username-field';
import { UsernameField } from '~/common/username-field';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/contexts';
import { useAttributes } from '~/hooks/use-attributes';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import { Separator } from '~/primitives/separator';

export function SignInStart() {
  const enabledConnections = useEnabledConnections();
  const { t } = useLocalizations();
  const { enabled: usernameEnabled } = useAttributes('username');
  const { enabled: phoneNumberEnabled } = useAttributes('phone_number');
  const { enabled: emailAddressEnabled } = useAttributes('email_address');
  const { enabled: passkeyEnabled } = useAttributes('passkey');
  const { applicationName } = useDisplayConfig();

  const hasConnection = enabledConnections.length > 0;
  const hasIdentifier = emailAddressEnabled || usernameEnabled || phoneNumberEnabled;
  const isDev = useDevModeWarning();
  const { layout } = useAppearance().parsedAppearance;
  const { logoProps, footerProps } = useCard();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        const connectionsWithSeperator = [
          <Connections disabled={isGlobalLoading} />,
          hasConnection && hasIdentifier ? <Separator>{t('dividerText')}</Separator> : null,
        ];
        return (
          <SignIn.Step name='start'>
            <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
              <Card.Content>
                <Card.Header>
                  <Card.Logo {...logoProps} />
                  <Card.Title>{t('signIn.start.title', { applicationName })}</Card.Title>
                  <Card.Description>{t('signIn.start.subtitle', { applicationName })}</Card.Description>
                </Card.Header>

                <GlobalError />

                <Card.Body>
                  {layout.socialButtonsPlacement === 'top' ? connectionsWithSeperator : null}

                  {hasIdentifier ? (
                    <div className='flex flex-col gap-4'>
                      {emailAddressEnabled && !phoneNumberEnabled && !usernameEnabled ? (
                        <EmailField
                          name='identifier'
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}

                      {usernameEnabled && !emailAddressEnabled && !phoneNumberEnabled ? (
                        <UsernameField
                          name='identifier'
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}

                      {phoneNumberEnabled && !emailAddressEnabled && !usernameEnabled ? (
                        <PhoneNumberField
                          name='identifier'
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}

                      {emailAddressEnabled && usernameEnabled && !phoneNumberEnabled ? (
                        <EmailOrUsernameField
                          name='identifier'
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}

                      {emailAddressEnabled && phoneNumberEnabled && !usernameEnabled ? (
                        <EmailOrPhoneNumberField
                          name='identifier'
                          toggleLabelEmail={t('signIn.start.actionLink__use_email')}
                          toggleLabelPhoneNumber={t('signIn.start.actionLink__use_phone')}
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}

                      {usernameEnabled && phoneNumberEnabled && !emailAddressEnabled ? (
                        <PhoneNumberOrUsernameField
                          name='identifier'
                          toggleLabelPhoneNumber={t('signIn.start.actionLink__use_phone')}
                          toggleLabelUsername={t('signIn.start.actionLink__use_username')}
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}

                      {emailAddressEnabled && usernameEnabled && phoneNumberEnabled ? (
                        <EmailOrUsernameOrPhoneNumberField
                          name='identifier'
                          toggleLabelEmailOrUsername={t('signIn.start.actionLink__use_email_username')}
                          toggleLabelPhoneNumber={t('signIn.start.actionLink__use_phone')}
                          disabled={isGlobalLoading}
                          required
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {layout.socialButtonsPlacement === 'bottom' ? connectionsWithSeperator.reverse() : null}
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
                            iconEnd={<Icon.CaretRightLegacy />}
                          >
                            {t('formButtonPrimary')}
                          </Button>
                        </SignIn.Action>
                      );
                    }}
                  </Common.Loading>

                  {
                    // Note:
                    // Currently this triggers the loading spinner for "Continue"
                    // which is a little confusing. We could use a manual
                    // setState on click, but we'll need to find a way to clean
                    // up the state based on `isSubmitting`
                    passkeyEnabled ? (
                      <Common.Loading scope='passkey'>
                        {isSubmitting => {
                          return (
                            <SignIn.Passkey asChild>
                              <LinkButton
                                type='button'
                                disabled={isGlobalLoading}
                              >
                                {t('signIn.start.actionLink__use_passkey')}
                              </LinkButton>
                            </SignIn.Passkey>
                          );
                        }}
                      </Common.Loading>
                    ) : null
                  }
                </Card.Actions>
              </Card.Content>

              <Card.Footer {...footerProps}>
                <Card.FooterAction>
                  <Card.FooterActionText>
                    {t('signIn.start.actionText')}{' '}
                    <Card.FooterActionLink href='/sign-up'> {t('signIn.start.actionLink')}</Card.FooterActionLink>
                  </Card.FooterActionText>
                </Card.FooterAction>
              </Card.Footer>
            </Card.Root>
          </SignIn.Step>
        );
      }}
    </Common.Loading>
  );
}
