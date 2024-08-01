import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { Connections } from '~/common/connections';
import { EmailField } from '~/common/email-field';
import { EmailOrPhoneNumberField } from '~/common/email-or-phone-number-field';
import { FirstNameField } from '~/common/first-name-field';
import { LastNameField } from '~/common/last-name-field';
import { OTPField } from '~/common/otp-field';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { UsernameField } from '~/common/username-field';
import { useAttributes } from '~/hooks/use-attributes';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { Alert } from '~/primitives/alert';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import { Separator } from '~/primitives/separator';

import { SignUpIdentifier } from './indentifiers';

export function SignUpComponent() {
  return (
    <SignUp.Root>
      <SignUpComponentLoaded />
    </SignUp.Root>
  );
}

function SignUpComponentLoaded() {
  const clerk = useClerk();
  const enabledConnections = useEnabledConnections();
  const { isDevelopmentOrStaging, userSettings } = useEnvironment();
  const { t } = useLocalizations();
  const { enabled: firstNameEnabled, required: firstNameRequired } = useAttributes('first_name');
  const { enabled: lastNameEnabled, required: lastNameRequired } = useAttributes('last_name');
  const { enabled: usernameEnabled, required: usernameRequired } = useAttributes('username');
  const { enabled: phoneNumberEnabled, required: phoneNumberRequired } = useAttributes('phone_number');
  const { enabled: emailAddressEnabled, required: emailAddressRequired } = useAttributes('email_address');
  const { enabled: passwordEnabled, required: passwordRequired } = useAttributes('password');
  const { applicationName, branded, homeUrl, logoImageUrl } = useDisplayConfig();

  const hasConnection = enabledConnections.length > 0;
  const hasIdentifier = emailAddressEnabled || usernameEnabled || phoneNumberEnabled;
  const isDev = isDevelopmentOrStaging();

  return (
    <Common.Loading>
      {isGlobalLoading => {
        return (
          <>
            <SignUp.Step name='start'>
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
                    <Card.Title>{t('signUp.start.title')}</Card.Title>
                    <Card.Description>
                      {t('signUp.start.subtitle', {
                        applicationName,
                      })}
                    </Card.Description>
                  </Card.Header>

                  <Common.GlobalError>
                    {({ message }) => {
                      return <Alert>{message}</Alert>;
                    }}
                  </Common.GlobalError>

                  <Card.Body>
                    <Connections disabled={isGlobalLoading} />

                    {hasConnection && hasIdentifier ? <Separator>{t('dividerText')}</Separator> : null}

                    {hasIdentifier ? (
                      <div className='flex flex-col gap-4'>
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

                        {emailAddressEnabled && !emailAddressRequired && phoneNumberEnabled && !phoneNumberRequired ? (
                          <EmailOrPhoneNumberField
                            toggleLabelEmail={t('signUp.start.actionLink__use_email')}
                            toggleLabelPhoneNumber={t('signUp.start.actionLink__use_phone')}
                          />
                        ) : (
                          <>
                            <EmailField disabled={isGlobalLoading} />

                            {phoneNumberEnabled ? (
                              <PhoneNumberField
                                required={phoneNumberRequired}
                                disabled={isGlobalLoading}
                                initPhoneWithCode={clerk.client.signUp.phoneNumber || ''}
                              />
                            ) : null}
                          </>
                        )}

                        {passwordEnabled && passwordRequired ? (
                          <PasswordField
                            validatePassword
                            label={t('formFieldLabel__password')}
                            required={passwordRequired}
                            disabled={isGlobalLoading}
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {userSettings.signUp.captcha_enabled ? <SignUp.Captcha className='empty:hidden' /> : null}
                  </Card.Body>
                  {hasConnection || hasIdentifier ? (
                    <Common.Loading scope='step:start'>
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
                  ) : null}
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>
                <Card.Footer branded={branded}>
                  <Card.FooterAction>
                    <Card.FooterActionText>
                      {t('signUp.start.actionText')}{' '}
                      <Card.FooterActionLink href='/sign-in'>{t('signUp.start.actionLink')}</Card.FooterActionLink>
                    </Card.FooterActionText>
                  </Card.FooterAction>
                </Card.Footer>
              </Card.Root>
            </SignUp.Step>

            <SignUp.Step name='verifications'>
              <Card.Root>
                <Card.Content>
                  <SignUp.Strategy name='phone_code'>
                    <Card.Header>
                      <Card.Title>{t('signUp.phoneCode.title')}</Card.Title>
                      <Card.Description>{t('signUp.phoneCode.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignUpIdentifier phoneNumber />
                          <SignUp.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='size-4 rounded-sm outline-none focus-visible:ring'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignUp.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>

                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>

                    <Card.Body>
                      <OTPField
                        label={t('signUp.phoneCode.formTitle')}
                        disabled={isGlobalLoading}
                        resend={
                          <SignUp.Action
                            asChild
                            resend
                            // eslint-disable-next-line react/no-unstable-nested-components
                            fallback={({ resendableAfter }) => (
                              <LinkButton
                                type='button'
                                disabled
                              >
                                {t('signUp.phoneCode.resendButton')} (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </LinkButton>
                            )}
                          >
                            <LinkButton type='button'>{t('signUp.phoneCode.resendButton')}</LinkButton>
                          </SignUp.Action>
                        }
                      />
                    </Card.Body>
                    <Common.Loading scope='step:verifications'>
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
                  </SignUp.Strategy>

                  <SignUp.Strategy name='email_code'>
                    <Card.Header>
                      <Card.Title>{t('signUp.emailCode.title')}</Card.Title>
                      <Card.Description>{t('signUp.emailCode.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignUpIdentifier emailAddress />
                          <SignUp.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='size-4 rounded-sm outline-none focus-visible:ring'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignUp.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>

                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>

                    <Card.Body>
                      <OTPField
                        label={t('signUp.emailCode.formTitle')}
                        disabled={isGlobalLoading}
                        resend={
                          <SignUp.Action
                            asChild
                            resend
                            // eslint-disable-next-line react/no-unstable-nested-components
                            fallback={({ resendableAfter }) => (
                              <LinkButton
                                type='button'
                                disabled
                              >
                                {t('signUp.emailCode.resendButton')} (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </LinkButton>
                            )}
                          >
                            <LinkButton type='button'>{t('signUp.emailCode.resendButton')}</LinkButton>
                          </SignUp.Action>
                        }
                      />
                    </Card.Body>
                    <Common.Loading scope='step:verifications'>
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
                  </SignUp.Strategy>

                  <SignUp.Strategy name='email_link'>
                    <Card.Header>
                      <Card.Title>{t('signUp.emailLink.title')}</Card.Title>
                      <Card.Description>
                        {t('signUp.emailLink.subtitle', {
                          applicationName,
                        })}
                      </Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignUpIdentifier emailAddress />
                          <SignUp.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='size-4 rounded-sm outline-none focus-visible:ring'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignUp.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>

                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>

                    <Card.Body>
                      <SignUp.Action
                        resend
                        asChild
                        // eslint-disable-next-line react/no-unstable-nested-components
                        fallback={({ resendableAfter }) => {
                          return (
                            <LinkButton
                              type='button'
                              disabled
                            >
                              {t('signUp.emailLink.resendButton')} (
                              <span className='tabular-nums'>{resendableAfter}</span>)
                            </LinkButton>
                          );
                        }}
                      >
                        <LinkButton type='button'>{t('signUp.emailLink.resendButton')}</LinkButton>
                      </SignUp.Action>
                    </Card.Body>
                  </SignUp.Strategy>
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>
                <Card.Footer branded={branded} />
              </Card.Root>
            </SignUp.Step>

            <SignUp.Step name='continue'>
              <Card.Root>
                <Card.Content>
                  <Card.Header>
                    <Card.Title>{t('signUp.continue.title')}</Card.Title>
                    <Card.Description>{t('signUp.continue.subtitle')}</Card.Description>
                  </Card.Header>

                  <Common.GlobalError>
                    {({ message }) => {
                      return <Alert>{message}</Alert>;
                    }}
                  </Common.GlobalError>

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
          </>
        );
      }}
    </Common.Loading>
  );
}
