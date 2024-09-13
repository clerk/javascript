import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { BackupCodeField } from '~/common/backup-code-field';
import { GlobalError } from '~/common/global-error';
import { OTPField } from '~/common/otp-field';
import { PasswordField } from '~/common/password-field';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import { useResetPasswordFactor } from '~/hooks/use-reset-password-factor';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import CaretRightLegacySm from '~/primitives/icons/caret-right-legacy-sm';
import PenSm from '~/primitives/icons/pen-sm';
import { LinkButton } from '~/primitives/link';
import { formatSafeIdentifier } from '~/utils/format-safe-identifier';

export function SignInVerifications() {
  const { t } = useLocalizations();
  const { applicationName } = useDisplayConfig();

  const isDev = useDevModeWarning();
  const isPasswordResetSupported = useResetPasswordFactor();
  const { logoProps, footerProps } = useCard();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignIn.Step
            asChild
            name='verifications'
          >
            <Card.Root
              as='form'
              banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}
            >
              <Card.Content>
                <SignIn.Strategy name='password'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
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
                            <PenSm />
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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>

                    <SignIn.Action
                      navigate='choose-strategy'
                      asChild
                    >
                      <LinkButton disabled={isGlobalLoading}>{t('signIn.password.actionLink')}</LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='passkey'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
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
                            <PenSm />
                          </button>
                        </SignIn.Action>
                      </span>
                    </Card.Description>
                  </Card.Header>

                  <GlobalError />

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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>
                    <SignIn.Action
                      navigate='choose-strategy'
                      asChild
                    >
                      <LinkButton disabled={isGlobalLoading}>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='backup_code'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
                    <Card.Title>{t('signIn.backupCodeMfa.title')}</Card.Title>
                    <Card.Description>{t('signIn.backupCodeMfa.subtitle')}</Card.Description>
                  </Card.Header>

                  <GlobalError />

                  <Card.Body>
                    <BackupCodeField />
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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>
                    <SignIn.Action
                      navigate='choose-strategy'
                      asChild
                    >
                      <LinkButton
                        disabled={isGlobalLoading}
                        type='button'
                      >
                        {t('footerActionLink__useAnotherMethod')}
                      </LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='email_code'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
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
                            <PenSm />
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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>

                    <SignIn.Action
                      asChild
                      navigate='choose-strategy'
                    >
                      <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='phone_code'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
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
                            <PenSm />
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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>

                    <SignIn.Action
                      asChild
                      navigate='choose-strategy'
                    >
                      <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='email_link'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
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
                            <PenSm />
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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>
                  </Card.Actions>
                </SignIn.Strategy>

                <SignIn.Strategy name='totp'>
                  <Card.Header>
                    <Card.Logo {...logoProps} />
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
                              iconEnd={<CaretRightLegacySm />}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          </SignIn.Action>
                        );
                      }}
                    </Common.Loading>
                    <SignIn.Action
                      asChild
                      navigate='choose-strategy'
                    >
                      <LinkButton type='button'>{t('footerActionLink__useAnotherMethod')}</LinkButton>
                    </SignIn.Action>
                  </Card.Actions>
                </SignIn.Strategy>
              </Card.Content>
              <Card.Footer {...footerProps} />
            </Card.Root>
          </SignIn.Step>
        );
      }}
    </Common.Loading>
  );
}
