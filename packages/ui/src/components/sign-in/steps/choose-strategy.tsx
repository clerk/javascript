import { useSignIn } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { Connections } from '~/common/connections';
import { GlobalError } from '~/common/global-error';
import { useGetHelp } from '~/components/sign-in/hooks/use-get-help';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import EnvelopeSm from '~/primitives/icons/envelope-sm';
import FingerprintSm from '~/primitives/icons/fingerprint-sm';
import LinkSm from '~/primitives/icons/link-sm';
import LockSm from '~/primitives/icons/lock-sm';
import SmsSm from '~/primitives/icons/sms-sm';
import { LinkButton } from '~/primitives/link';

/* Internal
  ============================================ */

function FirstFactorConnections({ isGlobalLoading }: { isGlobalLoading: boolean }) {
  const { signIn } = useSignIn();
  const isFirstFactor = signIn?.status === 'needs_first_factor';

  if (isFirstFactor) {
    return <Connections disabled={isGlobalLoading} />;
  }
  return null;
}

/* Public
  ============================================ */

export function SignInChooseStrategy() {
  const { t } = useLocalizations();
  const { setShowHelp } = useGetHelp();

  const isDev = useDevModeWarning();
  const { logoProps, footerProps } = useCard();

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignIn.Step
            asChild
            name='choose-strategy'
          >
            <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
              <Card.Content>
                <Card.Header>
                  <Card.Logo {...logoProps} />
                  <Card.Title>{t('signIn.alternativeMethods.title')}</Card.Title>
                  <Card.Description>{t('signIn.alternativeMethods.subtitle')}</Card.Description>
                </Card.Header>

                <GlobalError />

                <Card.Body>
                  <div className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-2'>
                      <FirstFactorConnections isGlobalLoading={isGlobalLoading} />
                      <SignIn.SupportedStrategy
                        name='email_link'
                        asChild
                      >
                        <Button
                          intent='secondary'
                          iconStart={<LinkSm />}
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
                          iconStart={<EnvelopeSm />}
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
                          iconStart={<SmsSm />}
                        >
                          <SignIn.SafeIdentifier
                            transform={(identifier: string) =>
                              t('signIn.alternativeMethods.blockButton__phoneCode', {
                                identifier,
                              })
                            }
                          />
                        </Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy
                        name='passkey'
                        asChild
                      >
                        <Button
                          intent='secondary'
                          iconStart={<FingerprintSm />}
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
                          iconStart={<LockSm />}
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
                  </div>
                </Card.Body>
              </Card.Content>
              <Card.Footer {...footerProps}>
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
        );
      }}
    </Common.Loading>
  );
}
