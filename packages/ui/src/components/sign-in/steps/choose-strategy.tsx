import { useSignIn } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { Connections } from '~/common/connections';
import { GlobalError } from '~/common/global-error';
import { useGetHelp } from '~/components/sign-in/hooks/use-get-help';
import { useAppearance } from '~/hooks/use-appearance';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import { Separator } from '~/primitives/separator';

/* Internal
  ============================================ */

function FirstFactorConnections({
  isGlobalLoading,
  hasConnection,
}: {
  isGlobalLoading: boolean;
  hasConnection: boolean;
}) {
  const { t } = useLocalizations();
  const { signIn } = useSignIn();
  const isFirstFactor = signIn?.status === 'needs_first_factor';

  if (isFirstFactor) {
    return (
      <>
        <Connections disabled={isGlobalLoading} />
        {hasConnection ? <Separator>{t('dividerText')}</Separator> : null}
      </>
    );
  }
  return null;
}

/* Public
  ============================================ */

export function SignInChooseStrategy() {
  const enabledConnections = useEnabledConnections();
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const { setShowHelp } = useGetHelp();

  const hasConnection = enabledConnections.length > 0;
  const isDev = isDevelopmentOrStaging();
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

                <GlobalError />

                <Card.Body>
                  <div className='flex flex-col gap-6'>
                    <FirstFactorConnections
                      isGlobalLoading={isGlobalLoading}
                      hasConnection={hasConnection}
                    />
                    <div className='flex flex-col gap-3'>
                      <div className='flex flex-col gap-2'>
                        <SignIn.SupportedStrategy
                          name='email_link'
                          asChild
                        >
                          <Button
                            intent='secondary'
                            iconStart={<Icon.LinkSm />}
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
                            iconStart={<Icon.Envelope />}
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
                            iconStart={<Icon.SMSSm />}
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
                            iconStart={<Icon.FingerprintSm />}
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
                            iconStart={<Icon.LockSm />}
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
                  </div>
                </Card.Body>
                {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
              </Card.Content>
              <Card.Footer {...cardFooterProps}>
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
