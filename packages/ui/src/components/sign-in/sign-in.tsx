import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { EmailField } from '~/common/EmailField';
import { PasswordField } from '~/common/PasswordField';
import { PROVIDERS } from '~/constants';
import { getEnabledSocialConnectionsFromEnvironment } from '~/hooks/getEnabledSocialConnectionsFromEnvironment';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Icon from '~/primitives/icon';
import { SecondaryButton } from '~/primitives/secondary-button';
import { Seperator } from '~/primitives/seperator';

export function SignInComponent() {
  const clerk = useClerk();
  // @ts-ignore clerk is not null
  const enabledConnections = getEnabledSocialConnectionsFromEnvironment(clerk?.__unstable__environment);

  return (
    <SignIn.Root exampleMode>
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
                    <div className='space-y-2'>
                      <SecondaryButton icon={<Icon.GitHub />}>Continue with Github</SecondaryButton>
                      <SecondaryButton icon={<Icon.Google />}>Continue with Google</SecondaryButton>
                      <SecondaryButton icon={<Icon.Envelope />}>Email code to test@gmail.com</SecondaryButton>
                    </div>
                    <Seperator>or</Seperator>
                    <div className='space-y-4'>
                      <EmailField disabled={isGlobalLoading} />
                      <PasswordField disabled={isGlobalLoading} />
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
    </SignIn.Root>
  );
}
