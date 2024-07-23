import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import * as React from 'react';

import { BackupCodeField } from '~/common/backup-code-field';
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
import { useSupportEmail } from '~/hooks/use-support-email';
import { Alert } from '~/primitives/alert';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import { Seperator } from '~/primitives/seperator';
import { formatSafeIdentifier } from '~/utils/format-safe-identifier';

/**
 * Implementation Details:
 *
 * - For now we use a private context to switch between the "Get help" view and
 *   `SignIn.Step`s. Initially, this ternary was used within the relevant steps,
 *   but it lead to React rendering errors. Lifting the state and component here
 *   seemed to reolve those issues.
 * - We plan to revisit this again in https://linear.app/clerk/issue/SDKI-115;
 *   where we'll consider its integration within Elements, as well as ensure
 *   bulletproof a11y.
 */
export function SignInComponent() {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <GetHelpContext.Provider value={{ showHelp, setShowHelp }}>
      <SignIn.Root>{showHelp ? <SignInGetHelp /> : <SignInComponentLoaded />}</SignIn.Root>
    </GetHelpContext.Provider>
  );
}

interface GetHelp {
  showHelp: boolean;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const GetHelpContext = React.createContext<GetHelp | null>(null);

const useGetHelp = () => {
  const context = React.useContext(GetHelpContext);
  if (!context) {
    throw new Error('useGetHelp must be used within GetHelpContext.Provider');
  }
  return context;
};

function SignInGetHelp() {
  const { t } = useLocalizations();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const { isDevelopmentOrStaging } = useEnvironment();
  const isDev = isDevelopmentOrStaging();
  const supportEmail = useSupportEmail();
  const { setShowHelp } = useGetHelp();

  return (
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
          <Card.Title>{t('signIn.alternativeMethods.getHelp.title')}</Card.Title>
          <Card.Description>{t('signIn.alternativeMethods.getHelp.content')}</Card.Description>
        </Card.Header>
        <Card.Body>
          <div className='flex flex-col gap-4'>
            <Button
              onClick={() => {
                window.location.href = `mailto:${supportEmail}`;
              }}
              icon={<Icon.CaretRight />}
            >
              Email support
            </Button>

            <LinkButton onClick={() => setShowHelp(false)}>{t('backButton')}</LinkButton>
          </div>
        </Card.Body>
        {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
      </Card.Content>
      <Card.Footer branded={branded} />
    </Card.Root>
  );
}

export function SignInComponentLoaded() {
  const clerk = useClerk();
  // TODO to fix IsomorphicClerk
  const locationBasedCountryIso = (clerk as any)?.clerkjs.__internal_country;
  const enabledConnections = useEnabledConnections();
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { enabled: usernameEnabled } = useAttributes('username');
  const { enabled: phoneNumberEnabled } = useAttributes('phone_number');
  const { enabled: emailAddressEnabled } = useAttributes('email_address');
  const { enabled: passkeyEnabled } = useAttributes('passkey');
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const { setShowHelp } = useGetHelp();

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
                                ContinueContinueContinueContinueContinue
                              </Button>
                            </SignIn.Action>
                            <SignIn.Action
                              submit
                              asChild
                            >
                              <Button
                                busy={isSubmitting}
                                disabled={isGlobalLoading || isSubmitting}
                                icon={<Icon.CaretRight />}
                                intent='secondary'
                              >
                                ContinueContinueContinueContinueContinue
                              </Button>
                            </SignIn.Action>
                          </>
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
                          <SignIn.SafeIdentifier transform={formatSafeIdentifier} />
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

                  <SignIn.Strategy name='passkey'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.passkey.title')}</Card.Title>
                      <Card.Description>{t('signIn.passkey.subtitle')}</Card.Description>
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

                      <Common.Loading>
                        {isSubmitting => {
                          return (
                            <>
                              {
                                // Note:
                                // 1. Currently this triggers the loading
                                //    spinner for "Continue" which is a little
                                //    confusing. We could use a manual setState
                                //    on click, but we'll need to find a way to
                                //    clean up the state based on `isSubmitting`
                                // 2. This button doesn't currently work; it's
                                //    being tracked here:
                                //    https://linear.app/clerk/issue/SDKI-172
                              }

                              <SignIn.Passkey asChild>
                                <Button
                                  type='button'
                                  icon={<Icon.CaretRight />}
                                  busy={isSubmitting}
                                  disabled={isGlobalLoading || isSubmitting}
                                >
                                  {t('formButtonPrimary')}
                                </Button>
                              </SignIn.Passkey>

                              <SignIn.Action
                                navigate='choose-strategy'
                                asChild
                              >
                                <LinkButton disabled={isGlobalLoading || isSubmitting}>
                                  {t('footerActionLink__useAnotherMethod')}
                                </LinkButton>
                              </SignIn.Action>
                            </>
                          );
                        }}
                      </Common.Loading>
                    </Card.Body>
                  </SignIn.Strategy>

                  <SignIn.Strategy name='backup_code'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.backupCodeMfa.title')}</Card.Title>
                      <Card.Description>{t('signIn.backupCodeMfa.subtitle')}</Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>

                      <BackupCodeField label={t('formFieldLabel__backupCode')} />

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
                                <LinkButton
                                  disabled={isGlobalLoading || isSubmitting}
                                  type='button'
                                >
                                  {t('footerActionLink__useAnotherMethod')}
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

                  <SignIn.Strategy name='phone_code'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.phoneCode.title')}</Card.Title>
                      <Card.Description>{t('signIn.phoneCode.subtitle', { applicationName })}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          <SignIn.SafeIdentifier
                          // TODO: uncomment once https://github.com/clerk/javascript/pull/3749 is merged
                          // transform={formatSafeIdentifier}
                          />
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

                      <SignIn.Action
                        navigate='choose-strategy'
                        asChild
                      >
                        <LinkButton>{t('backButton')}</LinkButton>
                      </SignIn.Action>
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

                  <SignIn.Strategy name='totp'>
                    <Card.Header>
                      {logoImageUrl ? (
                        <Card.Logo
                          href={homeUrl}
                          src={logoImageUrl}
                          alt={applicationName}
                        />
                      ) : null}
                      <Card.Title>{t('signIn.totpMfa.formTitle')}</Card.Title>
                      <Card.Description>{t('signIn.totpMfa.subtitle', { applicationName })}</Card.Description>
                    </Card.Header>

                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <OTPField disabled={isGlobalLoading} />
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
                        <Button
                          intent='secondary'
                          icon={<Icon.LinkSm />}
                        >
                          <SignIn.SafeIdentifier
                            transform={(identifier: string) =>
                              t('signIn.alternativeMethods.blockButton__emailLink', {
                                identifier,
                              })
                            }
                          />
                        </Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='email_code'
                        asChild
                      >
                        <Button
                          intent='secondary'
                          icon={<Icon.Envelope />}
                        >
                          <SignIn.SafeIdentifier
                            transform={(identifier: string) =>
                              t('signIn.alternativeMethods.blockButton__emailCode', {
                                identifier,
                              })
                            }
                          />
                        </Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='phone_code'
                        asChild
                      >
                        <Button
                          intent='secondary'
                          icon={<Icon.SMSSm />}
                        >
                          {t('signIn.alternativeMethods.blockButton__phoneCode', {
                            // Correct masked identifier to be added in SDKI-117
                            identifier: SignIn.SafeIdentifier,
                          })}
                        </Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='passkey'
                        asChild
                      >
                        <Button
                          intent='secondary'
                          icon={<Icon.FingerprintSm />}
                        >
                          {t('signIn.alternativeMethods.blockButton__passkey')}
                        </Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='password'
                        asChild
                      >
                        <Button
                          intent='secondary'
                          icon={<Icon.LockSm />}
                        >
                          {t('signIn.alternativeMethods.blockButton__password')}
                        </Button>
                      </SignIn.SupportedStrategy>

                      {
                        // `SupportedStrategy`s that are only intended for use
                        // within `choose-strategy`, not the `forgot-password`
                        // `Step
                      }
                      <SignIn.SupportedStrategy
                        name='totp'
                        asChild
                      >
                        <Button intent='secondary'>{t('signIn.alternativeMethods.blockButton__totp')}</Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='backup_code'
                        asChild
                      >
                        <Button intent='secondary'>{t('signIn.alternativeMethods.blockButton__backupCode')}</Button>
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
                      <Card.FooterActionButton onClick={() => setShowHelp(true)}>
                        {' '}
                        {t('signIn.alternativeMethods.actionLink')}
                      </Card.FooterActionButton>
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

                        <SignIn.SupportedStrategy
                          name='email_link'
                          asChild
                        >
                          <Button
                            intent='secondary'
                            icon={<Icon.LinkSm />}
                          >
                            <SignIn.SafeIdentifier
                              transform={(identifier: string) =>
                                t('signIn.alternativeMethods.blockButton__emailLink', {
                                  identifier,
                                })
                              }
                            />
                          </Button>
                        </SignIn.SupportedStrategy>

                        <SignIn.SupportedStrategy
                          name='reset_password_email_code'
                          asChild
                        >
                          <Button
                            intent='secondary'
                            icon={<Icon.Envelope />}
                          >
                            <SignIn.SafeIdentifier
                              transform={(identifier: string) =>
                                t('signIn.alternativeMethods.blockButton__emailCode', {
                                  identifier,
                                })
                              }
                            />
                          </Button>
                        </SignIn.SupportedStrategy>

                        <SignIn.SupportedStrategy
                          name='phone_code'
                          asChild
                        >
                          <Button
                            intent='secondary'
                            icon={<Icon.SMSSm />}
                          >
                            {t('signIn.alternativeMethods.blockButton__phoneCode', {
                              // Correct masked identifier to be added in SDKI-117
                              identifier: SignIn.SafeIdentifier,
                            })}
                          </Button>
                        </SignIn.SupportedStrategy>

                        <SignIn.SupportedStrategy
                          name='passkey'
                          asChild
                        >
                          <Button
                            intent='secondary'
                            icon={<Icon.FingerprintSm />}
                          >
                            {t('signIn.alternativeMethods.blockButton__passkey')}
                          </Button>
                        </SignIn.SupportedStrategy>

                        <SignIn.SupportedStrategy
                          name='password'
                          asChild
                        >
                          <Button
                            intent='secondary'
                            icon={<Icon.LockSm />}
                          >
                            {t('signIn.alternativeMethods.blockButton__password')}
                          </Button>
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
                      <Card.FooterActionButton onClick={() => setShowHelp(true)}>
                        {' '}
                        {t('signIn.alternativeMethods.actionLink')}
                      </Card.FooterActionButton>
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
                        validatePassword
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
