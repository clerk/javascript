import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { enUS } from '@clerk/localizations';
import type { ClerkOptions, EnvironmentResource } from '@clerk/types';

import { EmailField } from '~/common/email-field';
import { EmailOrPhoneNumberField } from '~/common/email-or-phone-number-field';
import { EmailOrUsernameField } from '~/common/email-or-username-field';
import { EmailOrUsernameOrPhoneNumberField } from '~/common/email-or-username-or-phone-number-field';
import { OTPField } from '~/common/otp-field';
import { PhoneNumberField } from '~/common/phone-number-field';
import { PhoneNumberOrUsernameField } from '~/common/phone-number-or-username-field';
import { UsernameField } from '~/common/username-field';
import { PROVIDERS } from '~/constants';
import { Alert } from '~/primitives/alert';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link-button';
import { Seperator } from '~/primitives/seperator';
import { getEnabledSocialConnectionsFromEnvironment } from '~/utils/getEnabledSocialConnectionsFromEnvironment';
import { makeLocalizeable } from '~/utils/makeLocalizable';

export function SignInComponent() {
  return (
    <SignIn.Root>
      <SignInComponentLoaded />
    </SignIn.Root>
  );
}

export function SignInComponentLoaded() {
  const clerk = useClerk();
  // TODO: Replace `any` with proper types
  const t = makeLocalizeable(((clerk as any)?.options as ClerkOptions)?.localization || enUS);
  const enabledConnections = getEnabledSocialConnectionsFromEnvironment(
    (clerk as any)?.__unstable__environment as EnvironmentResource,
  );
  const locationBasedCountryIso = (clerk as any)?.__internal_country;
  const attributes = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.userSettings.attributes;
  const displayConfig = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.displayConfig;
  const { enabled: usernameEnabled } = attributes['username'];
  const { enabled: phoneNumberEnabled } = attributes['phone_number'];
  const { enabled: emailAddressEnabled } = attributes['email_address'];
  const { enabled: passkeyEnabled } = attributes['passkey'];
  const { applicationName, logoImageUrl, homeUrl } = displayConfig;

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
                    <Card.Description>{t('signIn.start.subtitle')}</Card.Description>
                  </Card.Header>

                  <Card.Body>
                    <Connection.Root>
                      {enabledConnections.map(c => {
                        const connection = PROVIDERS.find(provider => provider.id === c.provider);
                        const iconKey = connection?.icon;
                        const IconComponent = iconKey ? Icon[iconKey] : null;
                        return (
                          <Common.Connection
                            key={c.provider}
                            name={c.provider}
                            asChild
                          >
                            <Common.Loading scope={`provider:${c.provider}`}>
                              {isConnectionLoading => {
                                return (
                                  <Connection.Button
                                    busy={isConnectionLoading}
                                    disabled={isGlobalLoading || isConnectionLoading}
                                    icon={IconComponent ? <IconComponent className='text-base' /> : null}
                                    textVisuallyHidden={enabledConnections.length > 2}
                                  >
                                    {connection?.name || c.provider}
                                  </Connection.Button>
                                );
                              }}
                            </Common.Loading>
                          </Common.Connection>
                        );
                      })}
                    </Connection.Root>

                    <Seperator>{t('dividerText')}</Seperator>

                    <div className='flex flex-col gap-4'>
                      {emailAddressEnabled && !phoneNumberEnabled && !usernameEnabled ? (
                        <EmailField disabled={isGlobalLoading} />
                      ) : null}

                      {usernameEnabled && !emailAddressEnabled && !phoneNumberEnabled ? (
                        <UsernameField disabled={isGlobalLoading} />
                      ) : null}

                      {phoneNumberEnabled && !emailAddressEnabled && !usernameEnabled ? (
                        <PhoneNumberField
                          disabled={isGlobalLoading}
                          locationBasedCountryIso={locationBasedCountryIso}
                        />
                      ) : null}

                      {emailAddressEnabled && usernameEnabled && !phoneNumberEnabled ? (
                        <EmailOrUsernameField disabled={isGlobalLoading} />
                      ) : null}

                      {emailAddressEnabled && phoneNumberEnabled && !usernameEnabled ? (
                        <EmailOrPhoneNumberField
                          disabled={isGlobalLoading}
                          locationBasedCountryIso={locationBasedCountryIso}
                        />
                      ) : null}

                      {usernameEnabled && phoneNumberEnabled && !emailAddressEnabled ? (
                        <PhoneNumberOrUsernameField
                          disabled={isGlobalLoading}
                          locationBasedCountryIso={locationBasedCountryIso}
                        />
                      ) : null}

                      {emailAddressEnabled && usernameEnabled && phoneNumberEnabled ? (
                        <EmailOrUsernameOrPhoneNumberField
                          disabled={isGlobalLoading}
                          locationBasedCountryIso={locationBasedCountryIso}
                        />
                      ) : null}
                    </div>
                    <SignIn.Action
                      submit
                      asChild
                    >
                      <Common.Loading>
                        {isSubmitting => {
                          return (
                            <Button
                              icon={<Icon.CaretRight />}
                              busy={isSubmitting}
                              disabled={isGlobalLoading || isSubmitting}
                            >
                              {t('formButtonPrimary')}
                            </Button>
                          );
                        }}
                      </Common.Loading>
                    </SignIn.Action>

                    {
                      // Note:
                      // Currently this triggers the loading spinner for "Continue"
                      // which is a little confusing. We could use a manual
                      // setState on click, but we'll need to find a way to clean
                      // up the state based on `isSubmitting`
                      passkeyEnabled ? (
                        <SignIn.Passkey asChild>
                          <Common.Loading>
                            {isSubmitting => {
                              return (
                                <LinkButton disabled={isGlobalLoading || isSubmitting}>
                                  {t('signIn.start.actionLink__use_passkey')}
                                </LinkButton>
                              );
                            }}
                          </Common.Loading>
                        </SignIn.Passkey>
                      ) : null
                    }
                  </Card.Body>
                </Card.Content>

                <Card.Footer>
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
                  <SignIn.Strategy name='phone_code'>
                    <Card.Header>
                      <Card.Title>{t('signIn.phoneCode.title')}</Card.Title>
                      <Card.Description>{t('signIn.phoneCode.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          {/* TODO: elements work
                      1. https://linear.app/clerk/issue/SDK-1830/add-signup-elements-for-accessing-email-address-and-phone-number
                      2. https://linear.app/clerk/issue/SDK-1831/pre-populate-emailphone-number-fields-when-navigating-back-to-the
            */}
                          +1 (424) 424-4242{' '}
                          <SignIn.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Edit phone number'
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
                        // TODO:
                        // 1. Replace `button` with consolidated styles (tackled later)
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

                  <SignIn.Strategy name='email_code'>
                    <Card.Header>
                      <Card.Title>{t('signIn.emailCode.title')}</Card.Title>
                      <Card.Description>{t('signIn.emailCode.subtitle')}</Card.Description>
                      <Card.Description>
                        <span className='flex items-center justify-center gap-2'>
                          {/* TODO: elements work
                      1. https://linear.app/clerk/issue/SDK-1830/add-signup-elements-for-accessing-email-address-and-phone-number
                      2. https://linear.app/clerk/issue/SDK-1831/pre-populate-emailphone-number-fields-when-navigating-back-to-the
            */}
                          alex.carpenter@clerk.dev{' '}
                          <SignIn.Action
                            navigate='start'
                            asChild
                          >
                            <button
                              type='button'
                              className='focus-visible:ring-default size-4 rounded-sm outline-none focus-visible:ring-2'
                              aria-label='Edit email address'
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

                  <SignIn.Strategy name='email_link'>
                    <Card.Header>
                      <Card.Title>{t('signIn.emailLink.title')}</Card.Title>
                      <Card.Description>
                        {t('signIn.emailLink.subtitle', {
                          applicationName,
                        })}
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Common.GlobalError>
                        {({ message }) => {
                          return <Alert>{message}</Alert>;
                        }}
                      </Common.GlobalError>
                      <SignIn.Action
                        resend
                        asChild
                        // eslint-disable-next-line react/no-unstable-nested-components
                        fallback={({ resendableAfter }) => {
                          return (
                            <p className='text-gray-11 border border-transparent px-2.5 py-1.5 text-center text-base font-medium'>
                              {t('signIn.emailLink.resendButton')} (
                              <span className='tabular-nums'>{resendableAfter}</span>)
                            </p>
                          );
                        }}
                      >
                        <LinkButton type='button'>{t('signIn.emailLink.resendButton')}</LinkButton>
                      </SignIn.Action>
                    </Card.Body>
                  </SignIn.Strategy>
                </Card.Content>
                <Card.Footer />
              </Card.Root>
            </SignIn.Step>
          </>
        );
      }}
    </Common.Loading>
  );
}
