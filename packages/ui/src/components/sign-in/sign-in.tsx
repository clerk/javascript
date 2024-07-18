import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { Connections } from '~/common/connections';
import { EmailField } from '~/common/email-field';
import { EmailOrPhoneNumberField } from '~/common/email-or-phone-number-field';
import { EmailOrUsernameField } from '~/common/email-or-username-field';
import { EmailOrUsernameOrPhoneNumberField } from '~/common/email-or-username-or-phone-number-field';
import { OTPField } from '~/common/otp-field';
import { PasswordField } from '~/common/password-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { PhoneNumberOrUsernameField } from '~/common/phone-number-or-username-field';
import { UsernameField } from '~/common/username-field';
import { useAttributes } from '~/hooks/use-attributes';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { useResetPasswordFactor } from '~/hooks/use-reset-password-factor';
import { Alert } from '~/primitives/alert';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link-button';
import { SecondaryButton } from '~/primitives/secondary-button';
import { Seperator } from '~/primitives/seperator';

export function SignInComponent() {
  return (
    <SignIn.Root>
      <SignInComponentLoaded />
    </SignIn.Root>
  );
}

export function SignInComponentLoaded() {
  const clerk = useClerk();
  const locationBasedCountryIso = (clerk as any)?.__internal_country;
  const enabledConnections = useEnabledConnections();
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { enabled: usernameEnabled } = useAttributes('username');
  const { enabled: phoneNumberEnabled } = useAttributes('phone_number');
  const { enabled: emailAddressEnabled } = useAttributes('email_address');
  const { enabled: passkeyEnabled } = useAttributes('passkey');
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const hasConnection = enabledConnections.length > 0;
  const hasIdentifier = emailAddressEnabled || usernameEnabled || phoneNumberEnabled;
  const isDev = isDevelopmentOrStaging();
  const isPasswordResetSupported = useResetPasswordFactor();

  return (
    <Common.Loading>
      {isGlobalLoading => {
        return (
          <>
            <SignIn.Step name='start'>
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
                    <Card.Title>{t('signIn.start.title', { applicationName })}</Card.Title>
                    <Card.Description>{t('signIn.start.subtitle', { applicationName })}</Card.Description>
                  </Card.Header>

                  <Card.Body>
                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>

                    <Connections disabled={isGlobalLoading} />

                    {hasConnection && hasIdentifier ? <Seperator>{t('dividerText')}</Seperator> : null}

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
                            locationBasedCountryIso={locationBasedCountryIso}
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
                            disabled={isGlobalLoading}
                            locationBasedCountryIso={locationBasedCountryIso}
                            required
                          />
                        ) : null}

                        {usernameEnabled && phoneNumberEnabled && !emailAddressEnabled ? (
                          <PhoneNumberOrUsernameField
                            name='identifier'
                            disabled={isGlobalLoading}
                            locationBasedCountryIso={locationBasedCountryIso}
                            required
                          />
                        ) : null}

                        {emailAddressEnabled && usernameEnabled && phoneNumberEnabled ? (
                          <EmailOrUsernameOrPhoneNumberField
                            name='identifier'
                            disabled={isGlobalLoading}
                            locationBasedCountryIso={locationBasedCountryIso}
                            required
                          />
                        ) : null}
                      </div>
                    ) : null}

                    <Common.Loading>
                      {isSubmitting => {
                        return (
                          <SignIn.Action
                            submit
                            asChild
                          >
                            <Button
                              icon={<Icon.CaretRight />}
                              busy={isSubmitting}
                              disabled={isGlobalLoading || isSubmitting}
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
                        <Common.Loading>
                          {isSubmitting => {
                            return (
                              <SignIn.Passkey asChild>
                                <LinkButton
                                  type='button'
                                  disabled={isGlobalLoading || isSubmitting}
                                >
                                  {t('signIn.start.actionLink__use_passkey')}
                                </LinkButton>
                              </SignIn.Passkey>
                            );
                          }}
                        </Common.Loading>
                      ) : null
                    }
                  </Card.Body>
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>

                <Card.Footer branded={branded}>
                  <Card.FooterAction>
                    <Card.FooterActionText>
                      {t('signIn.start.actionText')}{' '}
                      <Card.FooterActionLink href='/sign-up'> {t('signIn.start.actionLink')}</Card.FooterActionLink>
                    </Card.FooterActionText>
                  </Card.FooterAction>
                </Card.Footer>
              </Card.Root>
            </SignIn.Step>

            <SignIn.Step name='verifications'>
              <Card.Root>
                <Card.Content>
                  <SignIn.Strategy name='password'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.password.title')}</Card.Title>
                      <Card.Description>{t('signIn.password.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignIn.SafeIdentifier />
                          <SignIn.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='text-accent-9 focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignIn.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>

                      <PasswordField
                        alternativeFieldTrigger={
                          isPasswordResetSupported ? (
                            <SignIn.Action
                              navigate='forgot-password'
                              asChild
                            >
                              <LinkButton
                                size='sm'
                                disabled={isGlobalLoading}
                                type='button'
                              >
                                {t('formFieldAction__forgotPassword')}
                              </LinkButton>
                            </SignIn.Action>
                          ) : null
                        }
                      />

                      <Common.Loading>
                        {isSubmitting => {
                          return (
                            <>
                              <SignIn.Action
                                submit
                                asChild
                              >
                                <Button
                                  icon={<Icon.CaretRight />}
                                  busy={isSubmitting}
                                  disabled={isGlobalLoading || isSubmitting}
                                >
                                  {t('formButtonPrimary')}
                                </Button>
                              </SignIn.Action>

                              <SignIn.Action
                                navigate='choose-strategy'
                                asChild
                              >
                                <LinkButton disabled={isGlobalLoading || isSubmitting}>
                                  {t('signIn.password.actionLink')}
                                </LinkButton>
                              </SignIn.Action>
                            </>
                          );
                        }}
                      </Common.Loading>
                    </Card.Body>
                  </SignIn.Strategy>

                  <SignIn.Strategy name='email_code'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.emailCode.title')}</Card.Title>
                      <Card.Description>{t('signIn.emailCode.subtitle', { applicationName })}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignIn.SafeIdentifier />
                          <SignIn.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='text-accent-9 focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignIn.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>

                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <OTPField
                        disabled={isGlobalLoading}
                        resend={
                          <SignIn.Action
                            asChild
                            resend
                            // eslint-disable-next-line react/no-unstable-nested-components
                            fallback={({ resendableAfter }) => (
                              <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                                {t('signIn.emailCode.resendButton')} (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </p>
                            )}
                          >
                            <LinkButton type='button'>{t('signIn.emailCode.resendButton')}</LinkButton>
                          </SignIn.Action>
                        }
                      />
                      <Common.Loading scope='step:verifications'>
                        {isSubmitting => {
                          return (
                            <div className='flex flex-col gap-4'>
                              <SignIn.Action
                                submit
                                asChild
                              >
                                <Button
                                  busy={isSubmitting}
                                  disabled={isGlobalLoading}
                                  icon={<Icon.CaretRight />}
                                >
                                  {t('formButtonPrimary')}
                                </Button>
                              </SignIn.Action>

                              <SignIn.Action
                                asChild
                                navigate='choose-strategy'
                              >
                                <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                              </SignIn.Action>
                            </div>
                          );
                        }}
                      </Common.Loading>
                    </Card.Body>
                  </SignIn.Strategy>

                  <SignIn.Strategy name='email_link'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.emailLink.title')}</Card.Title>
                      <Card.Description>{t('signIn.emailLink.formSubtitle', { applicationName })}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignIn.SafeIdentifier />
                          <SignIn.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='text-accent-9 focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Start again'
                            >
                              <Icon.PencilUnderlined />
                            </button>
                          </SignIn.Action>
                        </span>
                      </Card.Description>
                    </Card.Header>

                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <SignIn.Action
                        asChild
                        resend
                        // eslint-disable-next-line react/no-unstable-nested-components
                        fallback={({ resendableAfter }) => (
                          <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                            {t('signIn.emailLink.resendButton')} (
                            <span className='tabular-nums'>{resendableAfter}</span>)
                          </p>
                        )}
                      >
                        <LinkButton type='button'>{t('signIn.emailLink.resendButton')}</LinkButton>
                      </SignIn.Action>

                      <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                    </Card.Body>
                  </SignIn.Strategy>

                  <SignIn.Strategy name='reset_password_email_code'>
                    <Card.Header>
                      <Card.Title>{t('signIn.forgotPassword.title')}</Card.Title>
                      <Card.Description>{t('signIn.forgotPassword.subtitle_email')}</Card.Description>
                      <Card.Description>
                        <SignIn.SafeIdentifier />
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <OTPField
                        disabled={isGlobalLoading}
                        resend={
                          <SignIn.Action
                            asChild
                            resend
                            // eslint-disable-next-line react/no-unstable-nested-components
                            fallback={({ resendableAfter }) => (
                              <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                                {t('signIn.phoneCode.resendButton')} (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </p>
                            )}
                          >
                            <LinkButton type='button'>{t('signIn.phoneCode.resendButton')}</LinkButton>
                          </SignIn.Action>
                        }
                      />
                      <Common.Loading scope='step:verifications'>
                        {isSubmitting => {
                          return (
                            <SignIn.Action
                              submit
                              asChild
                            >
                              <Button
                                busy={isSubmitting}
                                disabled={isGlobalLoading}
                                icon={<Icon.CaretRight />}
                              >
                                {t('formButtonPrimary')}
                              </Button>
                            </SignIn.Action>
                          );
                        }}
                      </Common.Loading>
                    </Card.Body>
                  </SignIn.Strategy>
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>
                <Card.Footer branded={branded} />
              </Card.Root>
            </SignIn.Step>

            <SignIn.Step name='choose-strategy'>
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
                    <Card.Title>{t('signIn.alternativeMethods.title')}</Card.Title>
                    <Card.Description>{t('signIn.alternativeMethods.subtitle')}</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>
                    <div className='flex flex-col gap-2'>
                      <Connections disabled={isGlobalLoading} />

                      <SignIn.SupportedStrategy
                        name='email_link'
                        asChild
                      >
                        <SecondaryButton icon={<Icon.LinkSm />}>
                          {t('signIn.alternativeMethods.blockButton__emailLink', {
                            identifier: SignIn.SafeIdentifier,
                          })}
                        </SecondaryButton>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='email_code'
                        asChild
                      >
                        <SecondaryButton icon={<Icon.Envelope />}>
                          {t('signIn.alternativeMethods.blockButton__emailCode', {
                            identifier: SignIn.SafeIdentifier,
                          })}
                        </SecondaryButton>
                      </SignIn.SupportedStrategy>
                    </div>

                    <SignIn.Action
                      navigate='previous'
                      asChild
                    >
                      <LinkButton>{t('backButton')}</LinkButton>
                    </SignIn.Action>
                  </Card.Body>
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>
                <Card.Footer branded={branded}>
                  <Card.FooterAction>
                    <Card.FooterActionText>
                      {t('signIn.alternativeMethods.actionText')}{' '}
                      <Card.FooterActionLink
                        // To be implemented in SDKI-115
                        href='#'
                      >
                        {' '}
                        {t('signIn.alternativeMethods.actionLink')}
                      </Card.FooterActionLink>
                    </Card.FooterActionText>
                  </Card.FooterAction>
                </Card.Footer>
              </Card.Root>
            </SignIn.Step>

            <SignIn.Step name='forgot-password'>
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
                    <Card.Title>{t('signIn.forgotPasswordAlternativeMethods.title')}</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>
                    <div className='flex flex-col justify-center gap-4'>
                      <SignIn.SupportedStrategy
                        name='reset_password_email_code'
                        asChild
                      >
                        <Button>{t('signIn.forgotPasswordAlternativeMethods.blockButton__resetPassword')}</Button>
                      </SignIn.SupportedStrategy>

                      <Seperator>{t('signIn.forgotPasswordAlternativeMethods.label__alternativeMethods')}</Seperator>

                      <div className='flex flex-col gap-2'>
                        <Connections disabled={isGlobalLoading} />

                        {
                          // To be implemented in SDKI-72
                        }
                        <SignIn.SupportedStrategy
                          name='email_link'
                          asChild
                        >
                          <SecondaryButton icon={<Icon.LinkSm />}>
                            {t('signIn.alternativeMethods.blockButton__emailLink', {
                              identifier: SignIn.SafeIdentifier,
                            })}
                          </SecondaryButton>
                        </SignIn.SupportedStrategy>

                        <SignIn.SupportedStrategy
                          name='reset_password_email_code'
                          asChild
                        >
                          <SecondaryButton icon={<Icon.Envelope />}>
                            {t('signIn.alternativeMethods.blockButton__emailCode', {
                              identifier: SignIn.SafeIdentifier,
                            })}
                          </SecondaryButton>
                        </SignIn.SupportedStrategy>
                      </div>

                      <SignIn.Action
                        navigate='start'
                        asChild
                      >
                        <LinkButton>{t('backButton')}</LinkButton>
                      </SignIn.Action>
                    </div>
                  </Card.Body>
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>
                <Card.Footer branded={branded}>
                  <Card.FooterAction>
                    <Card.FooterActionText>
                      {t('signIn.alternativeMethods.actionText')}{' '}
                      <Card.FooterActionLink
                        // To be implemented in SDKI-115
                        href='#'
                      >
                        {' '}
                        {t('signIn.alternativeMethods.actionLink')}
                      </Card.FooterActionLink>
                    </Card.FooterActionText>
                  </Card.FooterAction>
                </Card.Footer>
              </Card.Root>
            </SignIn.Step>

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
                  <Card.Body>
                    <Common.GlobalError>
                      {({ message }) => {
                        return <Alert>{message}</Alert>;
                      }}
                    </Common.GlobalError>
                    <div className='flex flex-col justify-center gap-4'>
                      <PasswordField
                        name='password'
                        label={t('formFieldLabel__newPassword')}
                      />
                      <PasswordField
                        name='confirmPassword'
                        label={t('formFieldLabel__confirmPassword')}
                      />

                      <Common.Loading>
                        {isSubmitting => {
                          return (
                            <>
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
                            </>
                          );
                        }}
                      </Common.Loading>
                    </div>
                  </Card.Body>
                  {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
                </Card.Content>
                <Card.Footer branded={branded} />
              </Card.Root>
            </SignIn.Step>
          </>
        );
      }}
    </Common.Loading>
  );
}
