import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { BackupCodeField } from '~/common/backup-code-field';
import { OTPField } from '~/common/otp-field';
import { PasswordField } from '~/common/password-field';
import { Card } from '~/common/sign-in-or-up/card';
import { StartOver } from '~/components/sign-in/components/start-over';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import { useResetPasswordFactor } from '~/hooks/use-reset-password-factor';
import { Button } from '~/primitives/button';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';

export function SignInVerifications() {
  const { t } = useLocalizations();
  const { applicationName } = useDisplayConfig();

  const isPasswordResetSupported = useResetPasswordFactor();

  return (
    <Common.Loading>
      {isGlobalLoading => {
        return (
          <SignIn.Step name='verifications'>
            <SignIn.Strategy name='password'>
              <Card
                title={t('signIn.password.title')}
                description={[
                  t('signIn.password.subtitle'),
                  <StartOver
                    key='password-start-again'
                    shouldFormatSafeIdentifier
                  />,
                ]}
                body={
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
                }
                actions={
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
                        </>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='passkey'>
              <Card
                title={t('signIn.passkey.title')}
                description={[t('signIn.passkey.subtitle'), <StartOver key='passkey-start-again' />]}
                actions={
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
                        </>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='backup_code'>
              <Card
                title={t('signIn.backupCodeMfa.title')}
                description={t('signIn.backupCodeMfa.subtitle')}
                body={<BackupCodeField />}
                actions={
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
                        </>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='email_code'>
              <Card
                title={t('signIn.emailCode.title')}
                description={[
                  t('signIn.emailCode.subtitle', { applicationName }),
                  <StartOver key='email-code-start-again' />,
                ]}
                body={
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
                }
                actions={
                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <>
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
                        </>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='phone_code'>
              <Card
                title={t('signIn.phoneCode.title')}
                description={[
                  t('signIn.phoneCode.subtitle', { applicationName }),
                  <StartOver
                    key='phone-code-start-again'
                    shouldFormatSafeIdentifier
                  />,
                ]}
                body={
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
                }
                actions={
                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <>
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
                        </>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='email_link'>
              <Card
                title={t('signIn.emailLink.title')}
                description={[
                  t('signIn.emailLink.formSubtitle', { applicationName }),
                  <StartOver key='email-link-start-again' />,
                ]}
                body={
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
                }
                actions={
                  <SignIn.Action
                    navigate='choose-strategy'
                    asChild
                  >
                    <LinkButton>{t('backButton')}</LinkButton>
                  </SignIn.Action>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='reset_password_email_code'>
              <Card
                title={t('signIn.forgotPassword.title')}
                description={[
                  t('signIn.forgotPassword.subtitle_email'),
                  <SignIn.SafeIdentifier key='reset-password-email-code-safe-identifier' />,
                ]}
                body={
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
                }
                actions={
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
                            iconEnd={<Icon.CaretRightLegacy />}
                          >
                            {t('formButtonPrimary')}
                          </Button>
                        </SignIn.Action>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>

            <SignIn.Strategy name='totp'>
              <Card
                title={t('signIn.totpMfa.formTitle')}
                description={t('signIn.totpMfa.subtitle', { applicationName })}
                body={
                  <OTPField
                    label={t('signIn.totpMfa.formTitle')}
                    disabled={isGlobalLoading}
                  />
                }
                actions={
                  <Common.Loading scope='step:verifications'>
                    {isSubmitting => {
                      return (
                        <>
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
                        </>
                      );
                    }}
                  </Common.Loading>
                }
              />
            </SignIn.Strategy>
          </SignIn.Step>
        );
      }}
    </Common.Loading>
  );
}
