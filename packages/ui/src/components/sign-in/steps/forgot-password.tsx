import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { Connections } from '~/common/connections';
import { GlobalError } from '~/common/global-error';
import { useGetHelp } from '~/components/sign-in/hooks/use-get-help';
import { useAppearance } from '~/hooks/use-appearance';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import { Separator } from '~/primitives/separator';

export function SignInForgotPassword() {
  const { isDevelopmentOrStaging } = useEnvironment();
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const { setShowHelp } = useGetHelp();

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

                <GlobalError />

                <Card.Body>
                  <SignIn.SupportedStrategy
                    name='reset_password_email_code'
                    asChild
                  >
                    <Button>{t('signIn.forgotPasswordAlternativeMethods.blockButton__resetPassword')}</Button>
                  </SignIn.SupportedStrategy>

                  <Separator>{t('signIn.forgotPasswordAlternativeMethods.label__alternativeMethods')}</Separator>

                  <div className='flex flex-col gap-2'>
                    <Connections
                      columns={1}
                      textVisuallyHidden={false}
                      disabled={isGlobalLoading}
                    />

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
                      name='reset_password_email_code'
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
                      name='reset_password_phone_code'
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
                  </div>

                  <SignIn.Action
                    navigate='start'
                    asChild
                  >
                    <LinkButton>{t('backButton')}</LinkButton>
                  </SignIn.Action>
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
