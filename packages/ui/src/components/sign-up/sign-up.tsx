import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { EmailField } from '~/common/EmailField';
import { FirstNameField } from '~/common/FirstNameField';
import { LastNameField } from '~/common/LastNameField';
import { OTPField } from '~/common/OTPField';
import { PasswordField } from '~/common/PasswordField';
import { PROVIDERS } from '~/constants';
import { getEnabledSocialConnectionsFromEnvironment } from '~/hooks/getEnabledSocialConnectionsFromEnvironment';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Icon from '~/primitives/icon';
import { Seperator } from '~/primitives/seperator';

export function SignUpComponent() {
  const clerk = useClerk();
  // @ts-ignore clerk is not null
  const enabledConnections = getEnabledSocialConnectionsFromEnvironment(clerk?.__unstable__environment);

  return (
    <SignUp.Root>
      <Common.Loading>
        {isGlobalLoading => {
          return (
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
                    <div className='space-y-4'>
                      <div className='flex gap-4'>
                        <FirstNameField disabled={isGlobalLoading} />
                        <LastNameField disabled={isGlobalLoading} />
                      </div>
                      <EmailField disabled={isGlobalLoading} />
                      <PasswordField disabled={isGlobalLoading} />
                      <OTPField
                        disabled={isGlobalLoading}
                        // TODO:
                        // 1. Replace `button` with `SignIn.Action` when `exampleMode` is removed
                        // 2. Replace `button` with consolidated styles (tackled later)
                        resend={
                          <>
                            Didn&apos;t recieve a code?{' '}
                            <button
                              type='button'
                              className='-mx-0.5 px-0.5 text-accent-9 font-medium hover:underline rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-default'
                            >
                              Resend
                            </button>
                          </>
                        }
                      />
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
          );
        }}
      </Common.Loading>
    </SignUp.Root>
  );
}
