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
  const { enabled: usernameEnabled } = attributes['username'];
  const { enabled: phoneNumberEnabled } = attributes['phone_number'];
  const { enabled: emailAddressEnabled } = attributes['email_address'];
  const { enabled: passkeyEnabled } = attributes['passkey'];

  return (
    <Common.Loading>
      {isGlobalLoading => {
        return (
          <SignIn.Step name='start'>
            <Card.Root>
              <Card.Content>
                <Card.Header>
                  <Card.Title>Sign in to Acme Corp</Card.Title>
                  <Card.Description>Welcome back! Please sign in to continue</Card.Description>
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
                  <Seperator>or</Seperator>
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

                    <OTPField
                      disabled={isGlobalLoading}
                      // TODO:
                      // 1. Replace `button` with `SignIn.Action` when `exampleMode` is removed
                      // 2. Replace `button` with consolidated styles (tackled later)
                      resend={
                        <>
                          Didn&apos;t recieve a code? <LinkButton>Resend</LinkButton>
                        </>
                      }
                    />
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
                            Continue
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
                    Don&apos;t have an account? <Card.FooterActionLink href='/sign-up'>Sign up</Card.FooterActionLink>
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
