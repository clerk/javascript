import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { EmailField } from '~/common/EmailField';
import { FirstNameField } from '~/common/FirstNameField';
import { LastNameField } from '~/common/LastNameField';
import { PasswordField } from '~/common/PasswordField';
import { PhoneNumberField } from '~/common/PhoneNumberField';
import { UsernameField } from '~/common/UsernameField';
import { PROVIDERS } from '~/constants';
import { getEnabledSocialConnectionsFromEnvironment } from '~/hooks/getEnabledSocialConnectionsFromEnvironment';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Icon from '~/primitives/icon';
import { Seperator } from '~/primitives/seperator';
import { TextButton } from '~/primitives/text-button';

export function SignUpComponent() {
  const clerk = useClerk();
  // @ts-ignore clerk is not null
  const enabledConnections = getEnabledSocialConnectionsFromEnvironment(clerk?.__unstable__environment);

  return (
    <SignUp.Root exampleMode>
      <Common.Loading>
        {isGlobalLoading => {
          return (
            <>
              <SignUp.Step
                data-clerk
                name='start'
              >
                <Card.Root>
                  <Card.Content>
                    <Card.Header>
                      <Card.Title>Create your account</Card.Title>
                      <Card.Description>Welcome! Please fill in the details to get started.</Card.Description>
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
                      <div className='space-y-4'>
                        <div className='flex gap-4'>
                          <FirstNameField disabled={isGlobalLoading} />
                          <LastNameField disabled={isGlobalLoading} />
                        </div>
                        <UsernameField disabled={isGlobalLoading} />
                        {/* @ts-ignore Expected https://github.com/clerk/javascript/blob/12f78491d6b10f2be63891f8a7f76fc6acf37c00/packages/clerk-js/src/ui/elements/PhoneInput/PhoneInput.tsx#L248-L249 */}
                        <PhoneNumberField locationBasedCountryIso={clerk.__internal_country} />
                        <EmailField disabled={isGlobalLoading} />
                        <PasswordField disabled={isGlobalLoading} />
                      </div>

                      <SignUp.Action
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
                      </SignUp.Action>
                    </Card.Body>
                  </Card.Content>
                  <Card.Footer>
                    <Card.FooterAction>
                      <Card.FooterActionText>
                        Have an account? <Card.FooterActionLink href='/sign-in'>Sign in</Card.FooterActionLink>
                      </Card.FooterActionText>
                    </Card.FooterAction>
                  </Card.Footer>
                </Card.Root>
              </SignUp.Step>

              <SignUp.Step name='verifications'>
                <Card.Root>
                  <Card.Content>
                    <SignUp.Strategy name='code'>code</SignUp.Strategy>
                    <SignUp.Strategy name='email_code'>email_code</SignUp.Strategy>
                    <SignUp.Strategy name='email_link'>
                      <Card.Header>
                        <Card.Title>Verify your email</Card.Title>
                        <Card.Description>Use the verification link sent to your email address</Card.Description>
                      </Card.Header>
                      <Card.Body>
                        <SignUp.Action
                          resend
                          asChild
                          // eslint-disable-next-line react/no-unstable-nested-components
                          fallback={({ resendableAfter }) => {
                            return (
                              <p className='flex items-center justify-center w-full bg-transparent text-gray-a11 font-medium rounded-md bg-clip-padding border border-transparent py-1.5 px-2.5 outline-none focus-visible:ring-[0.1875rem] focus-visible:ring-gray-a3 focus-visible:border-gray-a8 text-base'>
                                Didn&apos;t recieve a link? Resend (
                                <span className='tabular-nums'>{resendableAfter}</span>)
                              </p>
                            );
                          }}
                        >
                          <TextButton>Didn&apos;t recieve a link? Resend</TextButton>
                        </SignUp.Action>
                      </Card.Body>
                    </SignUp.Strategy>
                    <SignUp.Strategy name='phone_code'>phone_code</SignUp.Strategy>
                  </Card.Content>
                  <Card.Footer />
                </Card.Root>
              </SignUp.Step>

              <SignUp.Step name='continue'>
                <Card.Root>
                  <div className='space-y-4'>
                    <div className='flex gap-4'>
                      <FirstNameField disabled={isGlobalLoading} />
                      <LastNameField disabled={isGlobalLoading} />
                    </div>
                    <UsernameField disabled={isGlobalLoading} />
                    {/* @ts-ignore Expected https://github.com/clerk/javascript/blob/12f78491d6b10f2be63891f8a7f76fc6acf37c00/packages/clerk-js/src/ui/elements/PhoneInput/PhoneInput.tsx#L248-L249 */}
                    <PhoneNumberField locationBasedCountryIso={clerk.__internal_country} />
                    <EmailField disabled={isGlobalLoading} />
                    <PasswordField disabled={isGlobalLoading} />
                  </div>
                  <SignUp.Action
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
                  </SignUp.Action>
                </Card.Root>
              </SignUp.Step>
            </>
          );
        }}
      </Common.Loading>
    </SignUp.Root>
  );
}
