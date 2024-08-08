import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { BackupCodeField } from '~/common/backup-code-field';
import { GlobalError } from '~/common/global-error';
import { OTPField } from '~/common/otp-field';
import { PasswordField } from '~/common/password-field';
import { useAppearance } from '~/hooks/use-appearance';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { useResetPasswordFactor } from '~/hooks/use-reset-password-factor';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import { formatSafeIdentifier } from '~/utils/format-safe-identifier';

export function SignInVerifications() {
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const isDev = isDevelopmentOrStaging();
  const isPasswordResetSupported = useResetPasswordFactor();
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
                            className='text-accent-9 size-4 rounded-sm outline-none focus-visible:ring'
                            aria-label='Start again'
                          >
                            <Icon.PencilUnderlined />
                          </button>
                        </SignIn.Action>
                      </span>
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Card.Body>
                    <PasswordField
                      label={t('formFieldLabel__password')}
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
                              disabled={isGlobalLoading}
                              iconEnd={<Icon.CaretRightLegacy />}
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
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
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
                            className='text-accent-9 size-4 rounded-sm outline-none focus-visible:ring'
                            aria-label='Start again'
                          >
                            <Icon.PencilUnderlined />
                          </button>
                        </SignIn.Action>
                      </span>
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Common.Loading>
                    {isSubmitting => {
                      return (
                        <Card.Actions>
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

                          <SignIn.Action
                            navigate='choose-strategy'
                            asChild
                          >
                            <LinkButton disabled={isGlobalLoading || isSubmitting}>
                              {t('footerActionLink__useAnotherMethod')}
                            </LinkButton>
                          </SignIn.Action>
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
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

                  <GlobalError />

                  <Card.Body>
                    <BackupCodeField />
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
                              disabled={isGlobalLoading}
                              iconEnd={<Icon.CaretRightLegacy />}
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
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
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
                            className='text-accent-9 size-4 rounded-sm outline-none focus-visible:ring'
                            aria-label='Start again'
                          >
                            <Icon.PencilUnderlined />
                          </button>
                        </SignIn.Action>
                      </span>
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Card.Body>
                    <OTPField
                      label={t('signIn.emailCode.formTitle')}
                      disabled={isGlobalLoading}
                      resend={
                        <SignIn.Action
                          asChild
                          resend
                          // eslint-disable-next-line react/no-unstable-nested-components
                          fallback={({ resendableAfter }) => (
                            <LinkButton
                              type='button'
                              disabled
                            >
                              {t('signIn.emailCode.resendButton')} (
                              <span className='tabular-nums'>{resendableAfter}</span>)
                            </LinkButton>
                          )}
                        >
                          <LinkButton type='button'>{t('signIn.emailCode.resendButton')}</LinkButton>
                        </SignIn.Action>
                      }
                    />
                  </Card.Body>
                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <Card.Actions>
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

                          <SignIn.Action
                            asChild
                            navigate='choose-strategy'
                          >
                            <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                          </SignIn.Action>
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
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
                        <SignIn.SafeIdentifier transform={formatSafeIdentifier} />
                        <SignIn.Action
                          navigate='start'
                          asChild
                        >
                          <button
                            type='button'
                            className='text-accent-9 size-4 rounded-sm outline-none focus-visible:ring'
                            aria-label='Start again'
                          >
                            <Icon.PencilUnderlined />
                          </button>
                        </SignIn.Action>
                      </span>
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Card.Body>
                    <OTPField
                      label={t('signIn.phoneCode.formTitle')}
                      disabled={isGlobalLoading}
                      resend={
                        <SignIn.Action
                          asChild
                          resend
                          // eslint-disable-next-line react/no-unstable-nested-components
                          fallback={({ resendableAfter }) => (
                            <LinkButton
                              type='button'
                              disabled
                            >
                              {t('signIn.phoneCode.resendButton')} (
                              <span className='tabular-nums'>{resendableAfter}</span>)
                            </LinkButton>
                          )}
                        >
                          <LinkButton type='button'>{t('signIn.phoneCode.resendButton')}</LinkButton>
                        </SignIn.Action>
                      }
                    />
                  </Card.Body>

                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <Card.Actions>
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

                          <SignIn.Action
                            asChild
                            navigate='choose-strategy'
                          >
                            <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                          </SignIn.Action>
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
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
                            className='text-accent-9 size-4 rounded-sm outline-none focus-visible:ring'
                            aria-label='Start again'
                          >
                            <Icon.PencilUnderlined />
                          </button>
                        </SignIn.Action>
                      </span>
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Card.Body>
                    <SignIn.Action
                      asChild
                      resend
                      // eslint-disable-next-line react/no-unstable-nested-components
                      fallback={({ resendableAfter }) => (
                        <LinkButton
                          type='button'
                          disabled
                        >
                          {t('signIn.emailLink.resendButton')} (<span className='tabular-nums'>{resendableAfter}</span>)
                        </LinkButton>
                      )}
                    >
                      <LinkButton type='button'>{t('signIn.emailLink.resendButton')}</LinkButton>
                    </SignIn.Action>
                  </Card.Body>
                  <Card.Actions>
                    <SignIn.Action
                      navigate='choose-strategy'
                      asChild
                    >
                      <LinkButton>{t('backButton')}</LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='reset_password_email_code'>
                  <Card.Header>
                    <Card.Title>{t('signIn.forgotPassword.title')}</Card.Title>
                    <Card.Description>{t('signIn.forgotPassword.subtitle_email')}</Card.Description>
                    <Card.Description>
                      <SignIn.SafeIdentifier />
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Card.Body>
                    <OTPField
                      label={t('signIn.forgotPassword.formTitle')}
                      disabled={isGlobalLoading}
                      resend={
                        <SignIn.Action
                          asChild
                          resend
                          // eslint-disable-next-line react/no-unstable-nested-components
                          fallback={({ resendableAfter }) => (
                            <LinkButton
                              type='button'
                              disabled
                            >
                              {t('signIn.phoneCode.resendButton')} (
                              <span className='tabular-nums'>{resendableAfter}</span>)
                            </LinkButton>
                          )}
                        >
                          <LinkButton type='button'>{t('signIn.phoneCode.resendButton')}</LinkButton>
                        </SignIn.Action>
                      }
                    />
                  </Card.Body>

                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <Card.Actions>
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
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
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

                  <GlobalError />

                  <Card.Body>
                    <OTPField
                      label={t('signIn.totpMfa.formTitle')}
                      disabled={isGlobalLoading}
                    />
                  </Card.Body>

                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <Card.Actions>
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

                          <SignIn.Action
                            asChild
                            navigate='choose-strategy'
                          >
                            <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                          </SignIn.Action>
                        </Card.Actions>
                      );
                    }}
                  </Common.Loading>
                </SignIn.Strategy>
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
