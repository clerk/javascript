import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { GlobalError } from '~/common/global-error';
import { OTPField } from '~/common/otp-field';
import { useAppearance } from '~/hooks/use-appearance';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';
import type { RequireExactlyOne } from '~/types/utils';
import { parsePhoneString } from '~/utils/phone-number';

/* Internal
  ============================================ */

type Identifiers = {
  emailAddress: boolean;
  phoneNumber: boolean;
};

type Identifier = RequireExactlyOne<Identifiers>;

function SignUpIdentifier({ emailAddress, phoneNumber }: Identifier) {
  const { client } = useClerk();

  if (emailAddress) {
    return <span>{client.signUp.emailAddress}</span>;
  }

  if (phoneNumber) {
    const { formattedNumberWithCode } = parsePhoneString(client.signUp.phoneNumber || '');
    return <span>{formattedNumberWithCode}</span>;
  }

  return null;
}

/* Public
  ============================================ */

export function SignUpVerifications() {
  const { t } = useLocalizations();
  const { layout } = useAppearance();
  const { branded, applicationName, homeUrl, logoImageUrl } = useDisplayConfig();

  const renderDevModeNotice = useDevModeWarning();
  const cardFooterProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  return (
    <Common.Loading scope='global'>
      {isGlobalLoading => {
        return (
          <SignUp.Step name='verifications'>
            <Card.Root>
              <Card.Content>
                <SignUp.Strategy name='phone_code'>
                  <Card.Header>
                    {logoImageUrl ? (
                      <Card.Logo
                        href={homeUrl}
                        src={logoImageUrl}
                        alt={applicationName}
                      />
                    ) : null}
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

                  <GlobalError />

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
                    {logoImageUrl ? (
                      <Card.Logo
                        href={homeUrl}
                        src={logoImageUrl}
                        alt={applicationName}
                      />
                    ) : null}
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

                  <GlobalError />

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
                    {logoImageUrl ? (
                      <Card.Logo
                        href={homeUrl}
                        src={logoImageUrl}
                        alt={applicationName}
                      />
                    ) : null}
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

                  <GlobalError />

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
                {renderDevModeNotice ? <Card.Banner>Development mode</Card.Banner> : null}
              </Card.Content>
              <Card.Footer {...cardFooterProps} />
            </Card.Root>
          </SignUp.Step>
        );
      }}
    </Common.Loading>
  );
}
