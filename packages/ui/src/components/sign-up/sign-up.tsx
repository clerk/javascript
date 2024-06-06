import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { EmailField } from '~/common/EmailField';
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
    <SignUp.Root exampleMode>
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
                      {enabledConnections.map(connection => {
                        const iconKey = PROVIDERS.find(provider => provider.id === connection.provider)?.icon;
                        const IconComponent = iconKey ? Icon[iconKey] : null;
                        return (
                          <Common.Connection
                            key={connection.provider}
                            name={connection.provider}
                            asChild
                          >
                            <Common.Loading scope={`provider:${connection.provider}`}>
                              {isConnectionLoading => {
                                return (
                                  <Connection.Button
                                    busy={isConnectionLoading}
                                    disabled={isGlobalLoading || isConnectionLoading}
                                    icon={IconComponent ? <IconComponent className='text-base' /> : null}
                                  >
                                    {connection.name}
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
          );
        }}
      </Common.Loading>
    </SignUp.Root>
  );
}
